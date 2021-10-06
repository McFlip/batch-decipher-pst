import { Router } from 'express'
import { NextFunction, Request, Response } from 'express'
import * as sigsController from '../controllers/sigs'
import multer from 'multer'
import debug from 'debug'
import { pathValidator } from '../util/pathvalidator'
import fs from 'fs'
import path from 'path'

const debugSig = debug('sig')
const router = Router()
// file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const { caseId } = req.params
		const pstPath = `/app/workspace/${caseId}/sigsPSTs`
		const err = pathValidator(pstPath) ? null : new Error('Invalid sigsPSTs path')
		cb(err, `/app/workspace/${caseId}/sigsPSTs`)
	}
})
const upload = multer({ storage })
// clean out the upload dir
export const nuke = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { caseId } = req.params
	const pstPath = `/app/workspace/${caseId}/sigsPSTs`
	fs.readdirSync(pstPath).forEach(f => fs.rmSync(path.join(pstPath, f)))
	next()
}

// Upload PST files
router.post('/upload/:caseId', nuke, upload.array('pst'), sigsController.uploadSigsPst)
// Process Signed Email
router.post('/', sigsController.processSigs)
// Get certs from allCerts.txt
router.get('/:caseId', sigsController.getCerts)

export {router as sigsRte}
