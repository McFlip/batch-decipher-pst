import { pgTable, text, date, index } from "drizzle-orm/pg-core"
import { InferModel } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
// import { z } from "zod"

export const smimeCerts = pgTable("smime_cert", {
  sha1: text("sha1").primaryKey(),
  issuer: text("issuer"),
  validFrom: date("valid_from"),
  validTo: date("valid_to"),
  subject: text("subject"),
  email: text("email"),
})

export type SmimeCerts = InferModel<typeof smimeCerts>

/**
 * @todo regex for issuer  & subject
 * @todo date format?
 */
export const insertCertSchema = createInsertSchema(smimeCerts, {
  sha1: (schema) => schema.sha1.regex(/[0-9a-f]{40}/),
  email: (schema) => schema.email.email(),
})
