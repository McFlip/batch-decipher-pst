// SP initiated logout
// This pg will redirect to the SAML SSO Id Provider
import type { NextApiRequest, NextApiResponse } from 'next'
import sp from 'constants/serviceprovider' // SAML Service Provider
import idp from 'constants/idprovider' // SAML ID provider

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// create request url
	const { context } = sp.createLogoutRequest(idp, 'redirect', { logoutNameID: req.query?.email})
	// redirect to ID provicer
	// DEBUG
	console.log('logout request')
	console.log(context)
	return res.redirect(307, context) // 307 is temp redirect code
}
