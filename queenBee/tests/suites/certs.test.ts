import chai, { expect } from "chai"
import debug from "debug"
import apiURL from "../../index"
// import types
import type {} from "mocha"
import type {} from "chai-http"
import { db } from "../../db/conn"
import { smimeCerts } from "../../db/schema"
import { sql } from "drizzle-orm/sql"
import jwt from "../data/jwt"

const debugCerts = debug("certs")

/**
 * @description Create & Read certs in the cert archive
 * @param this certs.bind(this)
 * @todo setup & teardown functions for the database
 * @todo import db connection & schema types
 */
export default function certs(this: Mocha.Suite): void {
  this.beforeAll(async () => {
    await db.execute(
      sql`CREATE TABLE IF NOT EXISTS "smime_cert" ( "sha1" text PRIMARY KEY NOT NULL, "issuer" text, "valid_from" date, "valid_to" date, "subject" text, "email" text);`
    )
    await db.execute(sql`TRUNCATE smime_cert`)
    await db.insert(smimeCerts).values({
      sha1: "4da52c9731a03c858a2153c6defd5786f95e5882",
      email: "joe.schmo@fu.bar",
      issuer: "testIssuer",
      subject: "testSubj",
      validFrom: "4/20/2023",
      validTo: "4/20/2024",
    })
  })
  it("should return status 200 if a cert exists in the DB when searching by hash", async function () {
    const sha1 = "4da52c9731a03c858a2153c6defd5786f95e5882"
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
  it("should create a cert", async function () {})
  it("should return status 400 while creating a malformed cert", async function () {})
  it("should get all certs by email address", async function () {})
  it("should return statsu 404 if email can't be found", async function () {})
  it("should return status 400 searching by malformed email address", async function () {})
  it("should return status 404 if a cert is not in the DB when searching by email", async function () {})
}
