const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const {newDailyPuzzle} = require('./jobs/dailyPuzzle.js')

const PORT = process.env.PORT || 4001

app.use(express.json())

const allowedOrigins = ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins }));

const puzzleRoutes = require('./routes/puzzles.routes.js')
const userRoutes = require('./routes/users.routes.js')

app.use('/api/puzzles' , puzzleRoutes)
app.use('/api/users' , userRoutes)





app.listen(PORT , ()=>{
    console.log(`App is up and running @ ${PORT}`)
    newDailyPuzzle();
})