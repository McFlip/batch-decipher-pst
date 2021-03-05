import { Router } from 'express'
import * as keysController from '../controllers/keys'

const router = Router()

// Process Signed Email
router.post('/', keysController.extractKeys)

export {router as keysRte}
