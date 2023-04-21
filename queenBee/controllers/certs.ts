import { NextFunction, Request, Response } from "express"
import debug from "debug"
import { db } from "@/db/conn"
import { smimeCerts } from "@/db/schema"
import { SmimeCerts, insertCertSchema } from "@/db/schema"
import { and, eq, like, or } from "drizzle-orm/expressions"
import { z } from "zod"

const debugCert = debug("cert")

/**
 * @description Check if a cert already exists in the DB
 * @param req {sha1} hash of the cert to match against
 * @param res hash string if found, 404 error if not
 * @param next error handling
 */
export const haveCert = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { sha1 } = req.params
  debugCert(sha1)
  try {
    const cert = await db
      .select({ sha1: smimeCerts.sha1 })
      .from(smimeCerts)
      .where(eq(smimeCerts.sha1, sha1))
    debugCert("haveCert", cert)
    if (cert.length === 1) {
      res.status(200).send(cert[0])
    } else {
      res.status(404).json({ err: "cert not found" })
    }
  } catch (error) {
    next(error)
  }
}

/**
 * @description Get all certs matching an email address
 * @param req {email} address to search by
 * @param res array of cert objects
 * @param next error handling
 */
export const getCerts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const parsedEmail = z.string().email().safeParse(req.params.email)
  if (parsedEmail.success) {
    const email = parsedEmail.data
    debugCert("getCerts email:", email)
    try {
      const certs = await db
        .select()
        .from(smimeCerts)
        .where(eq(smimeCerts.email, email))
      debugCert("getCerts certs: ", certs)
      if (certs.length > 0) {
        res.status(200).send(certs)
      } else {
        res.status(404).json({ err: "certs not found" })
      }
    } catch (error) {
      next(error)
    }
  } else {
    res.status(400).json({ err: "malformed email" })
  }
}

export const createCert = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  debugCert("req cert: ", req.body.cert)
  const cert = insertCertSchema.safeParse(req.body.cert)
  if (cert.success) {
    try {
      await db.insert(smimeCerts).values(cert.data)
      res.status(201).send()
    } catch (error) {
      next(error)
    }
  } else {
    debugCert(cert.error.message)
    res.status(400).send({ err: "malformed cert" })
  }
}
