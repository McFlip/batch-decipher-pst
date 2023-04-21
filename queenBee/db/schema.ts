import { pgTable, text, date, index } from 'drizzle-orm/pg-core'
import { InferModel } from 'drizzle-orm'

export const smimeCerts = pgTable('smime_cert', {
  sha1: text('sha1').primaryKey(),
  issuer: text('issuer'),
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  subject: text('subject'),
  email: text('email')
})

export type SmimeCerts = InferModel<typeof smimeCerts>