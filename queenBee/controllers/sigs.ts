import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import dockerode from 'dockerode'
import debug from 'debug'
import CaseType from '../types/case'

const debugSig = debug('sig')
const dockerAPI = new dockerode({socketPath: '/var/run/docker.sock'})

export const uploadSigsPst = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { caseId } = req.params
        const pstPath = `/app/workspace/${caseId}/sigsPSTs`
        debugSig(pstPath)
        if (!caseId) throw new Error("no case ID")
        debugSig(req.files)
        debugSig(fs.readdirSync(pstPath))
        fs.readdirSync(pstPath).forEach(f => fs.renameSync(path.join(pstPath, f), path.join(pstPath, `${f}.pst`)))
        debugSig(fs.readdirSync(pstPath))
        res.status(201).send('PST(s) uploaded')
    } catch (error) {
        /* istanbul ignore next */
        next(error)
    }
}

// clean out the upload dir
export const nuke = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const { caseId } = req.params
	const pstPath = `/app/workspace/${caseId}/sigsPSTs`
	try {
		fs.readdirSync(pstPath).forEach(f => fs.rmSync(path.join(pstPath, f)))
		res.status(200).send('PST files deleted')
	} catch (error) {
		next(error)
	}
}

export const processSigs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {caseId}: {caseId: string} = req.body
        // debugSig(caseId)
        if (!caseId) throw new Error("no case ID");
        const casePath = path.join('/app/workspace', caseId, 'case.json')
        if (!fs.existsSync(casePath)) {
            res.status(404).json({error: 'unable to find case in DB'})
        } else {
            const caseMeta = JSON.parse(fs.readFileSync(casePath).toString()) as CaseType
            debugSig(caseMeta)
            const basePath = path.join('/app/workspace', caseId)
            // write out the custodian GREP filters
            const custodians = caseMeta?.custodians
            if (!custodians) throw new Error('No custodian filter set')
            const custodianPath = path.join(basePath, 'custodianList.txt')
            fs.writeFileSync(custodianPath, custodians)
            // create container
            const inPath = path.join(basePath, 'sigsPSTs')
            if (!inPath) throw new Error('No PST path set')
            const outPath = path.join(basePath, 'sigs')
            const hive = process.env.NODE_ENV === 'test' ? 'test_hive' : 'batch-decipher-pst_hive'
            debugSig(`hive: ${hive}`)
            const container = await dockerAPI.run(
                'batch-decipher-pst_busybee',
                ['bash', 'getSigs.bash', inPath, outPath, custodianPath],
                res,
                { 
                    HostConfig: { 
                        Binds: [
                        `${hive}:/app/workspace:z`,
                        '/srv/public:/srv/public:z'
                        ],
                        Tmpfs: {
                            '/tmp/PST': 'rw,noexec'
                        }}
                })
                .then(data => data[1])
            await container.remove()
            res.end()
        }
    } catch (error) {
        next(error)
    }
}

export const getCerts = (req: Request, res: Response, next: NextFunction): void => {
    const {caseId} = req.params
    const casePath = path.join('/app/workspace', caseId)
    const certPath = path.join(casePath, '/sigs/', 'allCerts.txt')
    debugSig(certPath)
    if (!fs.existsSync(casePath)) {
        res.status(404).json({error: 'unable to find case in DB'})
    } else {
        try {
            fs.accessSync(certPath, fs.constants.R_OK) 
        } catch (err) {
            return next(new Error('cannot find or cannot open allCerts.txt'))
        }
        try {
            const certs = fs.readFileSync(certPath)
            res.status(200).send(certs.toString('ascii'))
        } catch (err) {
            /* istanbul ignore next */
            next(err)
        }
    }
}