import { Router } from 'express'
import * as sigsController from '../controllers/sigs'
import multer from 'multer'
import debug from 'debug'
import { pathValidator } from '../util/pathvalidator'

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

// Upload PST files
router.post('/upload/:caseId', upload.array('pst'), sigsController.uploadSigsPst)
// Delete uploaded PSTs
router.delete('/upload/pst/:caseId', sigsController.nuke)
// Process Signed Email
router.post('/', sigsController.processSigs)
// Get certs from allCerts.txt
router.get('/:caseId', sigsController.getCerts)

export {router as sigsRte}
