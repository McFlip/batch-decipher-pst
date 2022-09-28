// SAML Service Provider config
const saml = require('samlify')

const sp = saml.ServiceProvider({
	entityID: process.env.SP_ENTITY_ID,
	assertionConsumerService: [{
		isDefault: true,
		Binding: saml.Constants.BindingNamespace.Post,
		Location: process.env.SP_LOCATION
	}]
})

export default sp