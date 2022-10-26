// Receive SAML logout response
// Verify SAML token and display success page
import fs from 'fs'
const saml = require('samlify')
const validator = require('@authenio/samlify-node-xmllint') // validates SAML response xml
import sp from 'constants/serviceprovider' // SAML service provider

import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// SAML ID provider
	const idpXmlPath = process.env.NODE_ENV === 'development' ? 'idp.dev.xml' : 'idp.prod.xml'
	const ipMeta = fs.readFileSync(`public/${idpXmlPath}`)
	const idp = saml.IdentityProvider({ metadata: ipMeta })
	// DEBUG
	console.log(idp)
	// parse SAML response from ID Provider
	try {
		saml.setSchemaValidator(validator)
		// FIXME: this is supposed to parse response not request
		// const { extract } = await sp.parseLogoutRequest(idp, 'post', { body: req.body })
		// DEBUG
		console.log("Parsing SLO request")
		console.log(req.body)
		// console.log(extract)
		// display logout success
		res.status(200).send(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Enigma Single Log Out</title>
		</head>
		<body>
			<h1>You have successfully signed out.</h1>
			<p>You may close your browser tab/window</p>
			<p><a href="/">Log back in</a></p>
		</body>
		</html>
		`)
	} catch (error) {
		res.status(400).send(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Enigma Single Log Out</title>
		</head>
		<body>
			<h1>Bad Request</h1>
			<pre>${error}</pre>
		</body>
		</html>
		`)
	}
}