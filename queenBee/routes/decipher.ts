import { Router, NextFunction, Request, Response } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { pathValidator } from '../util/pathvalidator'
import * as decipherController from '../controllers/decipher'

const router = Router()

// file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const { caseId } = req.params
		const pstPath = `/app/workspace/${caseId}/ctPSTs`
		const err = pathValidator(pstPath) ? null : new Error('Invalid ctPSTs path')
		cb(err, `/app/workspace/${caseId}/ctPSTs`)
	}
})
const upload = multer({ storage })

// clean out the upload dir
export const nuke = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { caseId } = req.params
	const pstPath = `/app/workspace/${caseId}/ctPSTs`
	if (! pathValidator(pstPath)) return next(new Error('invalid pst path'))
	try {
		fs.readdirSync(pstPath).forEach(f => fs.rmSync(path.join(pstPath, f), { recursive: true }))
		res.status(200).send('PST files deleted')
	} catch (error) {
		/* istanbul ignore next */
		next(error)
	}
}

// Upload PST files
router.post('/upload/pst/:caseId', upload.array('pst'), decipherController.uploadCtPst)

// Delete uploaded PSTs
router.delete('/upload/pst/:caseId', nuke)

// Run decipher job
router.post('/', decipherController.decipher)

export {router as decipherRte}
