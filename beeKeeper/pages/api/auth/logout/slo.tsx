// Receive SAML logout response
// We're only supporting SP init logout so no need to verify SAML token
// Just display success page

/*
// imports for verification of SAMLResponse
import * as saml from 'samlify'
import * as validator from '@authenio/samlify-node-xmllint' // validates SAML response xml
import sp from 'constants/serviceprovider' // SAML service provider
import idp from 'constants/idprovider' // SAML ID provider
*/

import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// DEBUG
	// console.log("*** LOGOUT ***")
	// console.log("*** logout request body ***")
	// console.log(req.body.SAMLResponse)

	// parse SAML response from ID Provider NOTE: not doing this because only doing SP init logout
	/*  
	try {
		// validate schema & sig
		saml.setSchemaValidator(validator)
		const { extract } = await sp.parseLogoutResponse(idp, 'post', req)
		// validate issuer and destination
		const { issuer } = extract
		const { destination } = extract.response
		if(destination != process.env.SP_LOGOUT) {
			throw new Error(`Invalid logout response. Destination: ${destination}`)
		}
		if(issuer != process.env.IDP_ISSUER) {
			throw new Error(`Invalid logout response. Issuer: ${issuer}`)
		}
	} catch (error) {
		console.log(error)
	}
	*/
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
}