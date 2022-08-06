// SAML Service Provider config
// TODO: use env vars for entityID and Location
const saml = require('samlify')

const sp = saml.ServiceProvider({
	entityID: 'saml-poc',
	assertionConsumerService: [{
		isDefault: true,
		Binding: saml.Constants.BindingNamespace.Post,
		Location: 'http://localhost:3001/api/auth/login/response'
	}]
})

export default sp