import { Router } from 'express'
import * as decipherController from '../controllers/decipher'

const router = Router()

router.post('/', decipherController.decipher)

export {router as decipherRte}
