const ApiError = require("../utils/ApiError");

// Controller per recuperare un file da GridFS
const getFile = (bucket) => {
    return async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                throw new ApiError(400, "ID file mancante");
            }

            if (!bucket) {
                throw new ApiError(500, "GridFS bucket non disponibile");
            }

            // Cerca il file in GridFS
            const files = await bucket.find({ _id: id }).toArray();

            if (!files || files.length === 0) {
                throw new ApiError(404, "File non trovato");
            }

            const file = files[0];

            // Imposta gli header appropriati
            res.set("Content-Type", file.metadata?.contentType || "application/octet-stream");
            res.set("Content-Length", file.length);
            res.set("Cache-Control", "public, max-age=31536000"); // Cache per 1 anno

            // Crea lo stream di download
            const downloadStream = bucket.openDownloadStream(id);

            // Gestisci errori dello stream
            downloadStream.on("error", (error) => {
                console.error("Errore download file:", error);
                if (!res.headersSent) {
                    res.status(404).json({ error: "Errore durante il download del file" });
                }
            });

            // Pipe dello stream verso la risposta
            downloadStream.pipe(res);

        } catch (error) {
            console.error("Errore getFile:", error);

            if (!res.headersSent) {
                if (error instanceof ApiError) {
                    res.status(error.statusCode).json({ error: error.message });
                } else {
                    res.status(500).json({ error: "Errore interno del server" });
                }
            }
        }
    };
};

// Controller per eliminare un file da GridFS
const deleteFile = (bucket) => {
    return async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                throw new ApiError(400, "ID file mancante");
            }

            if (!bucket) {
                throw new ApiError(500, "GridFS bucket non disponibile");
            }

            // Verifica che il file esista
            const files = await bucket.find({ _id: id }).toArray();

            if (!files || files.length === 0) {
                throw new ApiError(404, "File non trovato");
            }

            // Elimina il file da GridFS
            await bucket.delete(id);

            res.status(200).json({
                message: "File eliminato con successo",
                id,
                success: true
            });

        } catch (error) {
            console.error("Errore deleteFile:", error);

            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Errore interno del server" });
            }
        }
    };
};

module.exports = {
    getFile,
    deleteFile,
};