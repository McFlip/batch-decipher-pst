// Next-Auth will auto redirect an unauthenticated user to this pg
// This pg will then redirect to the SAML SSO Id Provider
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
const saml = require('samlify')
import sp from 'constants/serviceprovider' // SAML Service Provider

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// SAML ID provider
	const { data: ipMeta } = await axios.get('http://localhost:8080/simplesaml/saml2/idp/metadata.php')
	const idp = saml.IdentityProvider({ metadata: ipMeta })
	// create request url
	const { id, context } = sp.createLoginRequest(idp, 'redirect')
	// redirect to ID provicer
	return res.redirect(307, context) // 307 is temp redirect code
}
