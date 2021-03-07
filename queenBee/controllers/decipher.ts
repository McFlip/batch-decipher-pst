import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import dockerode from 'dockerode'
import { Case } from '../models/case'
import debug from 'debug'
import CaseType from '../types/case'

const decipherDebug = debug('decipher')
const dockerAPI = new dockerode({socketPath: '/var/run/docker.sock'})

export const decipher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const {caseId}: {caseId: string} = req.body
      const {secrets}: {secrets: string[][]} = req.body
      if (!caseId) throw new Error("no case ID");
      const caseMeta = await Case.findById(caseId) as CaseType
      decipherDebug(caseMeta)
      if (!caseMeta) {
          res.status(404).json({error: 'unable to find case in DB'})
      } else {
          const basePath = path.join('/app/workspace', caseId)
          const {pstPath, ptPath, exceptionsPath} = caseMeta
          const keysPath = path.join(basePath, 'keys')
          // create the secret
          // validate pw exists for each p12
          const secretNames = secrets.map(s => s[0])
          decipherDebug(secrets)
          decipherDebug(keysPath)
          decipherDebug(fs.readdirSync(keysPath).filter(f => f.match(/$\.key/)?.length))
          if (!fs.readdirSync(keysPath)
            .filter(f => f.match(/\.key$/)?.length)
            .map(p => secretNames.includes(p))
            .reduce((p,c) => p && c)
          ) throw new Error('Missing password')
          // Pass secrets as env array in form 'PW_TEST=MrGlitter'
          const Env = secrets.map(s => `PW_${path.basename(s[0], '.key')}=${s[1]}`)
          decipherDebug(Env)
          const container = await dockerAPI.run(
                'batch-decipher-pst_busybee',
                ['bash', 'decipher.bash', pstPath, ptPath, keysPath, exceptionsPath],
                process.stdout,
                { 
                  HostConfig: { Binds: ['batch-decipher-pst_hive:/app/workspace'] },
                  Env
                })
                .then(data => data[1])
          await container.remove()
          res.status(201).send('decryption complete')
      } 
  } catch (err) {
      next(err) 
  }
}
