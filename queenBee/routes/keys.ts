import { Router } from 'express'
import * as keysController from '../controllers/keys'

const router = Router()

// Process Signed Email
router.post('/', keysController.extractKeys)
// Get serial #'s from previous job
router.get('/:caseId', keysController.getSerials)

export {router as keysRte}
