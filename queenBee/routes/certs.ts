import { Router } from "express"
import * as certsController from "../controllers/certs"
import debug from "debug"

const debugCert = debug("cert")
const router = Router()

// Check if cert exists in DB
router.get("/sha1/:sha1", certsController.haveCert)
// Get certs by email
router.get("/email/:email", certsController.getCerts)
// Create cert
router.post("/", certsController.createCert)

export { router as certsRte }
