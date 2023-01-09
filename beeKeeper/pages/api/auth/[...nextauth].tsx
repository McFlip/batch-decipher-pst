import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import * as saml from 'samlify'
import * as validator from '@authenio/samlify-node-xmllint' // validates SAML response xml
import sp from 'constants/serviceprovider' // SAML service provider
import idp from 'constants/idprovider' // SAML ID provider
import type Iuser from 'types/user'
import type Iattributes from 'types/attributes'
import type Iconditions from 'types/conditions'
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
				// parse SAML response
				try {
					saml.setSchemaValidator(validator)
					const samlBody = JSON.parse(decodeURIComponent(req.body.SAMLResponse))
					const { extract } = await sp.parseLoginResponse(idp, 'post', { body: samlBody })
					const { attributes, conditions }: { attributes: Iattributes, conditions: Iconditions} = extract
					console.log("Login Attributes")
					console.log(attributes)
					// assert extract.conditions are valid
					const timeMeow = Date.now()
					const timeStart = Date.parse(conditions.notBefore)
					const timeEnd = Date.parse(conditions.notOnOrAfter)
					if(timeMeow < timeStart || timeMeow >= timeEnd) {
						// returning null lets next-auth know auth failed
						return null
					}
					// return user attributes to next-auth
					return {
						...attributes,
						id: attributes.username
					}
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
			return user.role.includes('enigma_users')
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