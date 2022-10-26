import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import fs from 'fs'
const saml = require('samlify')
const validator = require('@authenio/samlify-node-xmllint') // validates SAML response xml
import sp from 'constants/serviceprovider' // SAML service provider
import type Iuser from 'types/user'
// import type Isession from 'types/session'
// import type { JWT } from 'next-auth/jwt'

export default NextAuth({
	providers: [
		CredentialsProvider({
			credentials: {
			// we're not collecting creds; we redirect to the SSO ID provider
			// 	username: { label: "Username", type: "text", placeholder: "jsmith" },
			// 	password: {  label: "Password", type: "password" }
			},
			async authorize(_credentials, req) {
				// SAML ID Provider
				const idpXmlPath = process.env.NODE_ENV === 'development' ? 'idp.dev.xml' : 'idp.prod.xml'
				const ipMeta = fs.readFileSync(`public/${idpXmlPath}`)
				const idp = saml.IdentityProvider({ metadata: ipMeta })
				// parse SAML response
				// TODO: define interface to 'extract'
				try {
					saml.setSchemaValidator(validator)
					const samlBody = JSON.parse(decodeURIComponent(req.body.SAMLResponse))
					const { extract } = await sp.parseLoginResponse(idp, 'post', { body: samlBody })
					console.log("Login Attributes")
					console.log(extract.attributes)
					// TODO: assert extract.conditions are valid
					// return user attributes to next-auth
					return extract.attributes
					// return { email: 'fu@bar.wtf'}
				} catch (error) {
					console.error(error)
					// returning null lets next-auth know auth failed
					return null
				}
			}
		})
	],
	pages: {
		signIn: '/api/auth/login/request'
	},
	callbacks: {
		async signIn({ user }: { user: Iuser}) {
			// Role-Based auth
			return user.Role.includes('enigma_users')
		},
		async redirect({ url, baseUrl }) {
			return url
		},
		async session({ session, user, token }) {
			// TODO: customize JWT for queenBee REST API
			return session
		},
		async jwt({ token, user, account, profile, isNewUser }) {
			// TODO: customize JWT for queenBee REST API
			return token
		}
	}
})