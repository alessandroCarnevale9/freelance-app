const errorHandler = (err, req, res, next) => {
  console.error("Errore catturato dal middleware:", err);

  // Se è un ApiError personalizzato
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      success: false,
    });
  }

  // Errori di validazione Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: messages.join(", "),
      success: false,
    });
  }

  // Errore di duplicazione (codice 11000 in MongoDB)
  if (err.code === 11000) {
    return res.status(409).json({
      error: "Questo indirizzo è già registrato",
      success: false,
    });
  }

  // Errori di cast MongoDB
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "ID non valido",
      success: false,
    });
  }

  // Errore generico
  res.status(500).json({
    error: err.message || "Errore interno del server",
    success: false,
  });
};

module.exports = errorHandler;