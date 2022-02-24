import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import dockerode from 'dockerode'
import debug from 'debug'
import {pathValidator} from '../util/pathvalidator'

const debugKeys = debug('keys')
const dockerAPI = new dockerode({socketPath: '/var/run/docker.sock'})

export const extractKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const {caseId, p12PW, keyPW}: {caseId: string, p12PW: string, keyPW: string} = req.body
      if (!caseId) throw new Error("no case ID");
      if (!p12PW) throw new Error("no password for p12")
      if (!keyPW) throw new Error("no password for extracted key")
      const basePath = path.join('/app/workspace', caseId)
      if (!pathValidator(basePath)) {
          res.status(404).json({error: 'unable to find case in filesystem'})
      } else {
          const p12Path = path.join(basePath, 'p12')
          const keysPath = path.join(basePath, 'keys')
          debugKeys("extracting keys")
          debugKeys(new Date().toLocaleString())
          debugKeys(keysPath)
          // Pass secrets as env array
          const Env = [`PW_P12=${p12PW}`, `PW_KEY=${keyPW}`]
          // debugKeys(Env)
          // const outLog = fs.createWriteStream('/app/workspace/outLog.txt')
          // const errLog = fs.createWriteStream('/app/workspace/errLog.txt')
          const container = await dockerAPI.run(
                'batch-decipher-pst_busybee',
                ['./getKeys.bash', p12Path, keysPath],
                // [outLog, errLog],
                [process.stdout, process.stderr],
                { 
                    HostConfig: { 
                        Binds: [
                        'batch-decipher-pst_hive:/app/workspace:z'
                    ]},
                    Env,
                    Tty: false
                })
                .then(([data, container]) => {
                  return container
                })
                await container.remove()
                getSerials(req, res, next)
              } 
            } catch (err) {
      debugKeys(err)
      next(err) 
  }
}
export const getSerials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {caseId}  = req?.params
    if (!caseId) throw new Error("no case ID")
    const keysPath = path.join('/app/workspace/', caseId, 'keys/')
    const serials = fs.readdirSync(keysPath).filter(fname => path.extname(fname) === '.key')
    res.status(200).send(serials)
  } catch (err) {
    next(err)
  }
}
