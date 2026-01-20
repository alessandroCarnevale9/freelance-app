const express = require('express');
const { getFile, deleteFile } = require('../controllers/fileController');
const verifyJWT = require('../middlewares/verifyJWT');

module.exports = (bucket) => {
    const router = express.Router();

    // Route pubbliche
    // GET /api/files/:id - Recupera un file da GridFS (PUBBLICA - tutti possono vedere le immagini)
    router.get('/:id', getFile(bucket));

    // Route protette (richiedono autenticazione)
    router.use(verifyJWT); // Tutte le route sotto richiedono JWT

    // DELETE /api/files/:id - Elimina un file da GridFS (PROTETTA)
    router.delete('/:id', deleteFile(bucket));

    return router;
};