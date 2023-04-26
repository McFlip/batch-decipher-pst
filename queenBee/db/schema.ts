import { pgTable, text, date, index } from "drizzle-orm/pg-core"
import { InferModel } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
// import { z } from "zod"

export const smimeCerts = pgTable(
  "smime_cert",
  {
    sha1: text("sha1").primaryKey(),
    serial: text("serial").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    userPrincipleName: text("upn").notNull(),
    issuer: text("issuer").notNull(),
    notBefore: date("not_before", { mode: "string" }).notNull(),
    notAfter: date("not_after", { mode: "string" }).notNull(),
  },
  (smimeCerts) => {
    return {
      emailIndex: index("email_idx").on(smimeCerts.email),
    }
  }
)

export type SmimeCerts = InferModel<typeof smimeCerts>

/**
 * @todo regex for issuer  & subject
 * @todo date format?
 */
export const insertCertSchema = createInsertSchema(smimeCerts, {
  sha1: (schema) => schema.sha1.regex(/[0-9A-F]{40}/),
  email: (schema) => schema.email.email(),
})
