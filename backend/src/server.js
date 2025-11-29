const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const Database = require('./config/database')

dotenv.config()
const PORT = process.env.PORT || 4000
const app = express()

;(async () => {
  try {
    const db = new Database(process.env.MONGODB_URI)
    const bucket = await db.connect('images')

    const authRoutes = require('./routes/auth')(bucket)
    const userRoutes = require('./routes/user')

    // middlewares
    app.use(express.json())
    app.use(cookieParser())

    // routes
    app.use('/auth', authRoutes)
    app.use('/api/user', userRoutes)

    // error handler *dopo* tutte le route
    app.use((err, req, res, next) => {
      const status = err.statusCode || err.status || 500;
      const message = err.message || 'Internal Server Error';
      if (status >= 500) console.error(err);
      res.status(status).json({ error: message });
    })

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Startup error:', err)
    process.exit(1)
  }
})().catch(err => {
  console.error('Unexpected startup error:', err)
  process.exit(1)
})