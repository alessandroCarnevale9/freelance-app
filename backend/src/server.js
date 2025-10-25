const express = require(`express`)
const dotenv = require('dotenv')
const Database = require('./config/database')

dotenv.config()
const PORT = process.env.PORT || 4000


const app = express()


const userRoute = require('./routes/user')


// Database construction
const db = new Database(process.env.MONGODB_URI)

// Database connection
db.connect().catch((err) => console.error(`Error connecting to DB:`, err))


// middlewares
app.use(express.json())


// routes
app.use(`/api/user`, userRoute)

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
})
