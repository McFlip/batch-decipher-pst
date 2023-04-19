// SAML ID Provider config
import * as saml from "samlify";
import fs from "fs";

const idpXmlPath =
  process.env.NODE_ENV === "development" ? "idp.dev.xml" : "idp.prod.xml";
const ipMeta = fs.readFileSync(`public/${idpXmlPath}`);
const idp = saml.IdentityProvider({
  metadata: ipMeta,
  wantLogoutRequestSigned: true,
  nameIDFormat: ["urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"],
});

export default idp;
