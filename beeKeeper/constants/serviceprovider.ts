// SAML Service Provider config
import * as saml from "samlify";
import fs from "fs";

const signingCert = fs.readFileSync("/app/tlscert/cert.pem");
// DEBUG: maybe use 2 key formats - PKCS8 for browser and PKCS1 for SAML?
const privateKey = fs.readFileSync("/app/tlscert/key.pem");

// TODO: make requestSignatureAlgorithm an env var and update README
const sp = saml.ServiceProvider({
  entityID: process.env.SP_ENTITY_ID,
  authnRequestsSigned: true,
  wantLogoutRequestSigned: true,
  signingCert,
  privateKey,
  requestSignatureAlgorithm:
    "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
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
