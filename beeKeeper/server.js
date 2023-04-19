// custom server for production using TLS
const https = require('https')
const fs = require('fs')
const { parse } = require('url')
const next = require('next')
const port = parseInt(process.env.PORT) || 443
const dev = false
const host = process.env.HOST
const app = next({
  dev,
  dir: __dirname,
	host,
	port
})
const handle = app.getRequestHandler()

var options = {
  key: fs.readFileSync('/app/tlscert/key.pem'),
  cert: fs.readFileSync('/app/tlscert/cert.pem'),
}

app.prepare().then(() => {
  https.createServer(options, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port)
})