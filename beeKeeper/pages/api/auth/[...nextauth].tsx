import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
	providers: [
		CredentialsProvider({
			credentials: { 
				username: { label: "Username", type: "text", placeholder: "jsmith" },
				password: {  label: "Password", type: "password" }
			},
			async authorize(credentials, req) {
				return {
					name: 'GI Joe',
					email: 'joe@us.army.mil'
				}
			}
		})
	],
	callbacks: {
		async signIn({ user, account, profile, email, credentials }) {
			return true
		},
		async redirect({ url, baseUrl }) {
			return url
		},
		async session({ session, user, token }) {
			return session
		},
		async jwt({ token, user, account, profile, isNewUser }) {
			return token
		}
	}
})