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
	fs.readdirSync(pstPath).forEach(f => fs.rmSync(path.join(pstPath, f)))
	next()
}

// Upload PST files
router.post('/upload/pst/:caseId', nuke, upload.array('pst'), decipherController.uploadCtPst)

router.post('/', decipherController.decipher)

export {router as decipherRte}
