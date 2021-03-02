import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
// TODO: remove axios?
// import axios from 'axios'
import dockerode from 'dockerode'
import { Case } from '../models/case'
import debug from 'debug'
import { Model, Document, Date } from 'mongoose'

const debugSig = debug('sig')
const dockerAPI = new dockerode({socketPath: '/var/run/docker.sock'})

interface CaseType extends Document {
    name: string,
    dateCreated: Date,
    status: string,
    pstPath: string,
    p12Path: string,
    ptPath: string,
    custodians: string
}
/*
const dockerAPI = axios.create({
    socketPath: '/var/run/docker.sock',
    baseURL: 'http://localhost/v1.41'
})
*/
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
            const inPath = caseMeta?.pstPath
            const outPath = path.join(basePath, 'sigs')
            // TODO: add binding for input data
            // TODO: is 'Volumes' key even necessary?
            const container = await dockerAPI.run(
                'batch-decipher-pst_busybee',
                ['bash', 'getSigs.bash', inPath, outPath, custodianPath],
                process.stdout,
                {
                    Volumes: { '/app/workspace': {} },
                    HostConfig: {
                        Binds: ['batch-decipher-pst_hive:/app/workspace']
                    }
                })
                .then(data => data[1])
            await container.remove()
            // const dockerRes = await dockerAPI.post('/containers/create', {
            //     Image: 'batch-decipher-pst_busybee',
            //     Cmd: ['getSigs.bash', inPath, outPath, custodianPath],
            //     Volumes: {
            //         '/app/workspace': {
            //             Source: 'hive'
            //         }
            //     }
            // })
            const certs = fs.readFileSync(path.join(outPath, 'allCerts.txt'))
            debugSig(certs)
            res.status(201).send(certs)
        }
    } catch (error) {
        next(error)
    }
}

export const getCerts = (req: Request, res: Response, next: NextFunction): void => {
    const {caseId} = req.params
}