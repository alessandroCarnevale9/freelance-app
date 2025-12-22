const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const Database = require("./config/database");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

(async () => {
  try {
    const db = new Database(process.env.MONGODB_URI);
    const bucket = await db.connect("images");

    const authRoutes = require("./routes/auth")(bucket);
    const userRoutes = require("./routes/user");

    // Middlewares di base
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);

    // Route 404 per endpoint non trovati
    app.use((req, res) => {
      res.status(404).json({
        error: `Route ${req.method} ${req.originalUrl} non trovata`,
        success: false
      });
    });

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})().catch((err) => {
  console.error("Unexpected startup error:", err);
  process.exit(1);
});