import express from 'express'
import bodyParser from 'body-parser'
import { caseRte } from './routes/cases'
import debug from 'debug'

const app = express()
const debugApp = debug('app')

// Configs
const PORT = 3000
// Config for CORS - set to Domain or http://localhost:8080 if deploying full stack
// Leave as '*' for public API
const ACAO = process.env.ALLOW_ORIGIN || '*'

// Middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// Cross Origin middleware
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', ACAO)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
  next()
})

app.get('/', (req, res) => res.send('Healthy :)\r\n'))
app.use('/cases', caseRte)

app.listen(PORT, () => {
  debugApp(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})