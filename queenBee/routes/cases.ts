import { Router } from 'express'
// import mongoose from 'mongoose'
// import multer from 'multer'
import * as caseController from '../controllers/cases'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const router: any = Router()

router.get('/', caseController.getCases)

export { router as caseRte }