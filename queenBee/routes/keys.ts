import { Router } from 'express'
import { NextFunction, Request, Response } from 'express'
import * as keysController from '../controllers/keys'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { pathValidator } from '../util/pathvalidator'

const router = Router()

// file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const { caseId } = req.params
		const p12Path = `/app/workspace/${caseId}/p12`
		const err = pathValidator(p12Path) ? null : new Error('Invalid p12 path')
		cb(err, `/app/workspace/${caseId}/p12`)
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '.p12')
	}
})
const upload = multer({ storage })
// clean out the upload dir
export const nuke = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { caseId } = req.params
	const p12 = `/app/workspace/${caseId}/p12`
	try{
		fs.readdirSync(p12).forEach(f => fs.rmSync(path.join(p12, f)))
	} catch (err) {
		return next(err)
	}
	next()
}
// extract key from uploaded p12 container
router.post('/:caseId', nuke, upload.single('p12'), keysController.extractKeys)
// Get serial #'s from previous job
router.get('/:caseId', keysController.getSerials)

export {router as keysRte}
