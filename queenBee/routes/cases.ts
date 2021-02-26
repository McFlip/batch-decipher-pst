import { Router } from 'express'
// import mongoose from 'mongoose'
// import multer from 'multer'
import * as caseController from '../controllers/cases'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const router: any = Router()

// CREATE case
router.post('/', caseController.create)
// READ by query string
router.get('/search', caseController.search)
// READ one case
router.get('/:caseId', caseController.getOne)
// READ all cases
router.get('/', caseController.getAll)
// // UPDATE case - merge
// router.patch('/:caseId', caseController.modify)
// // UPDATE case - replace
// router.put('/:caseId', caseController.overwrite)
// // DELETE case
// router.delete('/:caseId', caseController.delete)

export { router as caseRte }