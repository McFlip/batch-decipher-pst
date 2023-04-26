import chai, { expect } from "chai"
import debug from "debug"
import apiURL from "../../index"
import type {} from "mocha"
import type {} from "chai-http"
import { db } from "../../db/conn"
import { smimeCerts, SmimeCerts } from "../../db/schema"
import { sql } from "drizzle-orm/sql"
import jwt from "../data/jwt"

const debugCerts = debug("cert")

/**
 * @description Create & Read certs in the cert archive
 * @param this certs.bind(this)
 * @todo setup & teardown functions for the database
 * @todo import db connection & schema types
 */
export default function certs(this: Mocha.Suite): void {
  const certFixture: SmimeCerts = {
    serial: "A1B2C3",
    sha1: "4DA52C9731A03C858A2153C6DEFD5786F95E5882",
    email: "joe.schmo@fu.bar",
    issuer: "testIssuer",
    subject: "testSubj",
    userPrincipleName: "1234@com",
    notBefore: "2023-04-20",
    notAfter: "2024-04-20",
  }
  this.beforeAll(async () => {
    await db.execute(
      sql`CREATE TABLE IF NOT EXISTS "smime_cert" ("sha1" text PRIMARY KEY NOT NULL,"serial" text NOT NULL,"email" text NOT NULL,"subject" text NOT NULL,"upn" text NOT NULL,"issuer" text NOT NULL,"not_before" date NOT NULL,"not_after" date NOT NULL);`
    )
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS "email_idx" ON "smime_cert" ("email");`
    )
    await db.execute(sql`TRUNCATE smime_cert;`)
    await db.insert(smimeCerts).values(certFixture)
  })
  it("should return status 200 if a cert exists in the DB when searching by hash", async function () {
    const sha1 = "4DA52C9731A03C858A2153C6DEFD5786F95E5882"
    const res: ChaiHttp.Response = await chai
      .request(apiURL)
      .get(`/certs/sha1/${sha1}`)
      .set({ Authorization: `Bearer ${jwt}` })
    expect(res).to.have.status(200)
  })
  it("should return status 404 if a cert is not in the DB when searching by hash", async function () {
    const sha1 = "fubar"
    const res: ChaiHttp.Response = await chai
      .request(apiURL)
      .get(`/certs/sha1/${sha1}`)
      .set({ Authorization: `Bearer ${jwt}` })
    expect(res).to.have.status(404)
  })
  it("should create a cert", async function () {
    const cert: SmimeCerts = {
      serial: "1A2B3C",
      sha1: "00002C9731A03C858A2153C6DEFD5786F95E0000",
      email: "hooty.hoo@fu.bar",
      issuer: "testIssuer",
      subject: "testSubj",
      userPrincipleName: "4321@com",
      notBefore: "2023-04-20",
      notAfter: "2024-04-20",
    }
    const res: ChaiHttp.Response = await chai
      .request(apiURL)
      .post("/certs")
      .set({ Authorization: `Bearer ${jwt}` })
      .send({ cert })
    debugCerts("create test res: ", res.body)
    expect(res).to.have.status(201)
    const res2: ChaiHttp.Response = await chai
      .request(apiURL)
      .get(`/certs/sha1/${cert.sha1}`)
      .set({ Authorization: `Bearer ${jwt}` })
    expect(res2).to.have.status(200)
  })
  it("should return status 400 while creating a malformed cert", async function () {
    const cert = {
      sha1: "00002c9731a03c858a2153c6defd5786f95e0000", // hash hex letters must be uppercase
      email: "hooty.hoo@fu.bar",
      issuer: "testIssuer",
      subject: "testSubj",
      notBefore: "2023-04-20",
      notAfter: "2024-04-20",
    }
    const res: ChaiHttp.Response = await chai
      .request(apiURL)
      .post("/certs")
      .set({ Authorization: `Bearer ${jwt}` })
      .send({ cert })
    debugCerts("create test res: ", res.body)
    expect(res).to.have.status(400)
  })
  it("should get all certs by email address", async function () {
    const email = "joe.schmo@fu.bar"
    const res: ChaiHttp.Response = await chai
      .request(apiURL)
      .get(`/certs/email/${email}`)
      .set({ Authorization: `Bearer ${jwt}` })
    expect(res).to.have.status(200)
    expect(res.body).to.deep.eq([certFixture])
  })
  it("should return status 404 if a cert is not in the DB when searching by email", async function () {
    const email = "jane.doe@fu.bar"
    const res: ChaiHttp.Response = await chai
      .request(apiURL)
      .get(`/certs/email/${email}`)
      .set({ Authorization: `Bearer ${jwt}` })
    expect(res).to.have.status(404)
  })
  it("should return status 400 searching by malformed email address", async function () {
    const email = "fu.bar"
    const res: ChaiHttp.Response = await chai
      .request(apiURL)
      .get(`/certs/email/${email}`)
      .set({ Authorization: `Bearer ${jwt}` })
    expect(res).to.have.status(400)
  })
}
