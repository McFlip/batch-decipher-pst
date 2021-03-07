import express from 'express'
import bodyParser from 'body-parser'
import { caseRte } from './routes/cases'
import {sigsRte} from './routes/sigs'
import {keysRte} from './routes/keys'
import debug from 'debug'
import mongoose from 'mongoose'
import { decipherRte } from './routes/decipher'
// import { MockMongoose } from 'mock-mongoose'

const app = express()
const debugApp = debug('app')

// Configs
const PORT = 3000
// Config for CORS - set to Domain or http://localhost:8080 if deploying full stack
// Leave as '*' for public API
const ACAO = process.env.ALLOW_ORIGIN || '*'
const dbName = 'decipherDB'
const dbHost = `mongodb://database:27017/${dbName}`
const dbOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}

// Database connection
mongoose.connect(dbHost, dbOpts)
const db = mongoose.connection
db.once('open', () => debugApp('Mongoose is connected'))

// Middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// Cross Origin middleware
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', ACAO)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE')
  next()
})

app.use('/cases', caseRte)
app.use('/sigs', sigsRte)
app.use('/keys', keysRte)
app.use('/decipher', decipherRte)
app.get('/', (req, res) => res.send('Healthy :)\r\n'))

app.listen(PORT, () => {
  debugApp(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})

export default app