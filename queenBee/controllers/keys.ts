import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import dockerode from 'dockerode'
import { Case } from '../models/case'
import debug from 'debug'
import CaseType from '../types/case'

const debugKeys = debug('keys')
const dockerAPI = new dockerode({socketPath: '/var/run/docker.sock'})

export const extractKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const {caseId}: {caseId: string} = req.body
      const {secrets}: {secrets: string[][]} = req.body
      if (!caseId) throw new Error("no case ID");
      const caseMeta = await Case.findById(caseId) as CaseType
      debugKeys(caseMeta)
      if (!caseMeta) {
          res.status(404).json({error: 'unable to find case in DB'})
      } else {
          const basePath = path.join('/app/workspace', caseId)
          const {p12Path} = caseMeta
          const keysPath = path.join(basePath, 'keys')
          // create the secret
          // validate pw exists for each p12
          const secretNames = secrets.map(s => s[0])
          if (!fs.readdirSync(p12Path)
            .map(p => secretNames.includes(p))
            .reduce((p,c) => p && c)
          ) throw new Error('Missing password')
          // Pass secrets as env array in form 'PW_TEST=MrGlitter'
          const Env = secrets.map(s => `PW_${path.basename(s[0], '.p12')}=${s[1]}`)
          debugKeys(Env)
          const container = await dockerAPI.run(
                'batch-decipher-pst_busybee',
                ['bash', 'getKeys.bash', p12Path, keysPath],
                process.stdout,
                { 
                    HostConfig: { 
                        Binds: [
                        'batch-decipher-pst_hive:/app/workspace:z',
                        'batch-decipher-pst_public:/srv/public:z'
                    ]},
                    Env
                })
                .then(data => data[1])
          await container.remove()
          const serialTuples = fs.readFileSync(path.join(keysPath, 'serials.tsv'))
            .toString('ascii')
            .split('\n')
            .map(s => s.split('\t'))
            .filter(arr => arr.length === 2)
          res.status(201).send(serialTuples)
      } 
  } catch (err) {
      next(err) 
  }
}
export const getSerials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {caseId}  = req?.params
    if (!caseId) throw new Error("no case ID")
    const keysPath = path.join('/app/workspace/', caseId, 'keys/')
    const serialTuples = fs.readFileSync(path.join(keysPath, 'serials.tsv'))
      .toString('ascii')
      .split('\n')
      .map(s => s.split('\t'))
      .filter(arr => arr.length === 2)
    res.status(200).send(serialTuples)
  } catch (err) {
    next(err)
  }
}
