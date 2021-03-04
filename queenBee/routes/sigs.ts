import { Router } from 'express'
import * as sigsController from '../controllers/sigs'

const router = Router()

// Process Signed Email
router.post('/', sigsController.processSigs)
// Get certs from allCerts.txt
router.get('/:caseId', sigsController.getCerts)

export {router as sigsRte}
