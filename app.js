/* Import babel-register */
require('babel-register')

/* Declaration Require */
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const userRouter = require('./routes/users')
const mongoose = require('mongoose')

/* Database */
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/Itada',  { useNewUrlParser: true })

const app = express()

// Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())

app.use('/users', userRouter)

const port = process.env.PORT || 3000
app.listen(port)
console.log(`Server listening at ${port}`)