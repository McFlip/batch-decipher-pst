// Next-Auth will auto redirect an unauthenticated user to this pg
// This pg will then redirect to the SAML SSO Id Provider
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
const saml = require('samlify')
import sp from 'constants/serviceprovider' // SAML Service Provider

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// SAML ID provider
	const idpXmlPath = process.env.NODE_ENV === 'development' ? 'idp.dev.xml' : 'idp.prod.xml'
	const ipMeta = fs.readFileSync(`public/${idpXmlPath}`)
	const idp = saml.IdentityProvider({ metadata: ipMeta })
	// create request url
	const { id, context } = sp.createLoginRequest(idp, 'redirect')
	// redirect to ID provicer
	return res.redirect(307, context) // 307 is temp redirect code
}
