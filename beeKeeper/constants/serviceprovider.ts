// SAML Service Provider config
import * as saml from "samlify";
import fs from "fs";

const signingCert = fs.readFileSync("/app/tlscert/cert.pem");
// DEBUG: maybe use 2 key formats - PKCS8 for browser and PKCS1 for SAML?
const privateKey = fs.readFileSync("/app/tlscert/key.pem");

const sp = saml.ServiceProvider({
  entityID: process.env.SP_ENTITY_ID,
  authnRequestsSigned: process.env.NODE_ENV === 'production',
  wantLogoutRequestSigned: process.env.NODE_ENV === 'production',
  wantLogoutResponseSigned: process.env.NODE_ENV === 'production',
  signingCert,
  privateKey,
  requestSignatureAlgorithm: process.env.SP_SIG_ALGO,
  assertionConsumerService: [
    {
      isDefault: true,
      Binding: saml.Constants.BindingNamespace.Post,
      Location: process.env.SP_LOCATION,
    },
  ],
  singleLogoutService: [
    {
      Binding: saml.Constants.BindingNamespace.Post,
      Location: process.env.SP_LOGOUT,
    },
  ],
});

export default sp;
