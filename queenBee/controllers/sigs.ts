import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import dockerode from 'dockerode'
import { Case } from '../models/case'
import debug from 'debug'
import CaseType from '../types/case'
import { pathValidator } from '../util/pathvalidator'

const debugSig = debug('sig')
const dockerAPI = new dockerode({socketPath: '/var/run/docker.sock'})

export const uploadSigsPst = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { caseId } = req.params
        const pstPath = `/app/workspace/${caseId}/sigsPSTs`
        debugSig(pstPath)
        if (!caseId) throw new Error("no case ID")
        if (!pathValidator(pstPath)) {
            res.status(404).json({error: 'unable to find sigsPSTs folder in case workspace'})
        } else {
            debugSig(req.files)
            debugSig(fs.readdirSync(pstPath))
            fs.readdirSync(pstPath).forEach(f => fs.renameSync(path.join(pstPath, f), path.join(pstPath, `${f}.pst`)))
            debugSig(fs.readdirSync(pstPath))
            res.status(201).send('PST(s) uploaded')
        }
    } catch (error) {
        next(error)
    }
}

export const processSigs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {caseId}: {caseId: string} = req.body
        // debugSig(caseId)
        if (!caseId) throw new Error("no case ID");
        const caseMeta = await Case.findById(caseId) as CaseType
        debugSig(caseMeta)
        if (!caseMeta) {
            res.status(404).json({error: 'unable to find case in DB'})
        } else {
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
            const container = await dockerAPI.run(
                'batch-decipher-pst_busybee',
                ['bash', 'getSigs.bash', inPath, outPath, custodianPath],
                res,
                { 
                    HostConfig: { 
                        Binds: [
                        'batch-decipher-pst_hive:/app/workspace:z',
                        '/srv/public:/srv/public:z'
                        ],
                        Tmpfs: {
                            '/tmp/PST': 'rw,noexec'
                        }}
                })
                .then(data => data[1])
            await container.remove()
            res.end()
            // const certs = fs.readFileSync(path.join(outPath, 'allCerts.txt'))
            // debugSig(certs.toString("ascii"))
            // res.status(201).send(certs.toString('ascii'))
        }
    } catch (error) {
        next(error)
    }
}

export const getCerts = (req: Request, res: Response, next: NextFunction): void => {
    const {caseId} = req.params
    const certPath = path.join('/app/workspace', caseId, '/sigs/', 'allCerts.txt')
    // debugSig(certPath)
    try {
       fs.accessSync(certPath, fs.constants.R_OK) 
    } catch (err) {
        res.status(404).json({error: 'cannot find or cannot open allCerts.txt'})
    }
    try {
        const certs = fs.readFileSync(certPath)
        res.status(200).send(certs.toString('ascii'))
    } catch (err) {
        /* Istanbul ignore next */
        next(err)
    }
}