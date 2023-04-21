import { NextFunction, Request, Response } from "express"
import debug from "debug"
import { db } from "@/db/conn"
import { smimeCerts } from "@/db/schema"
import { and, eq, like, or } from "drizzle-orm/expressions"

const debugCert = debug("cert")

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
    debugCert(cert)
    if (cert.length === 1) {
      res.status(200).send(cert[0])
    } else {
      res.status(404).json({ err: "cert not found" })
    }
  } catch (error) {
    next(error)
  }
}
