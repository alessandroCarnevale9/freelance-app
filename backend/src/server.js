const express = require(`express`)
const dotenv = require('dotenv')
const Database = require('./config/database')

dotenv.config()
const PORT = process.env.PORT || 4000


const app = express()


const userRoutes = require('./routes/user')


// Database construction
const db = new Database(process.env.MONGODB_URI)

// Database connection
db.connect().catch((err) => console.error(`Error connecting to DB:`, err))


// middlewares
app.use(express.json())


// routes
app.use(`/api/user`, userRoutes)


// error handler *dopo* tutte le route
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  if (status >= 500) console.error(err);
    res.status(status).json({ error: message });
})

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
})
