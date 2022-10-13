// callback URL that SAML ID Provider redirects user to
// get CSRF token and add to POST form
// form submits to nextauth callback for credentials provider

import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// get CSRF token required by next-auth
	const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http'
	const { data, headers } = await axios.get("/api/auth/csrf", {
		baseURL: `${proto}://localhost:${process.env.PORT}`,
	})
	const { csrfToken } = data
	// parse SAML response from ID Provider
	const encodedSAMLBody = encodeURIComponent(JSON.stringify(req.body));
	res.setHeader("set-cookie", headers["set-cookie"] ?? "")
	// redirect w/ Post request - use self-submitting form
	res.status(200).send(
		`<html>
			<body>
				<form action="/api/auth/callback/credentials" method="POST">
					<input type="hidden" name="csrfToken" value="${csrfToken}"/>
					<input type="hidden" name="SAMLResponse" value="${encodedSAMLBody}"/>
				</form>
				<script>
					document.forms[0].submit();
				</script>
			</body>
		</html>`
	)
}