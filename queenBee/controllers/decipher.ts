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
          // validate pw exists for each key
          const secretNames = secrets.map(s => s[0])
          decipherDebug(secrets)
          decipherDebug(keysPath)
          decipherDebug(fs.readdirSync(keysPath).filter(f => f.match(/$\.key/)?.length))
          if (!fs.readdirSync(keysPath)
            .filter(f => f.match(/\.key$/)?.length)
            .map(p => secretNames.includes(path.basename(p, '.key')))
            .reduce((p,c) => p && c)
          ) throw new Error('Missing password')
          // Pass secrets as env array in form 'PW_TEST=MrGlitter'
          const Env = secrets.map(s => `PW_${path.basename(s[0], '.key')}=${s[1]}`)
          decipherDebug(Env)
          // hack to avoid CORS failure from timeout - send init progress update of 1%
          res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked'
          })
          res.write('1%\n')
          // use 'Mounts' subsection of 'HostConfig' to create tmpfs mount
          const container = await dockerAPI.run(
                'batch-decipher-pst_busybee',
                ['bash', 'decipher.bash', pstPath, ptPath, keysPath, exceptionsPath],
                res,
                { 
                  HostConfig: { 
                      Binds: [
                      'batch-decipher-pst_hive:/app/workspace:z',
                      'batch-decipher-pst_public:/srv/public:z',
                  ]},
                  Env
                })
                .then(data => data[1])
          await container.remove()
          res.end()
      } 
  } catch (err) {
      next(err) 
  }
}
