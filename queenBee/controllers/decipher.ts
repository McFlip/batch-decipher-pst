import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import dockerode from 'dockerode'
import debug from 'debug'
import { pathValidator } from '../util/pathvalidator'

const dockerAPI = new dockerode({socketPath: '/var/run/docker.sock'})
const sharePath = '/srv/public'

export const uploadCtPst = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const { caseId } = req.params
      const pstPath = `/app/workspace/${caseId}/ctPSTs`
      if (!caseId) throw new Error("no case ID")
      if (!pathValidator(pstPath)) {
          res.status(404).json({error: 'unable to find ctPSTs folder in case workspace'})
      } else {
          fs.readdirSync(pstPath).forEach(f => {
            if (path.extname(f) !== '.pst') fs.renameSync(path.join(pstPath, f), path.join(pstPath, `${f}.pst`)
          )})
          res.status(201).send('PST(s) uploaded')
      }
  } catch (error) {
      next(error)
  }
}

export const decipher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const decipherDebug = debug('decipher')
      const {caseId}: {caseId: string} = req.body
      const {secrets}: {secrets: string} = req.body
      if (!caseId) throw new Error("no case ID");
      const basePath = path.join('/app/workspace', caseId)
      const pstPath = path.join(basePath, 'ctPSTs')
      const ptPath = path.join(sharePath, caseId, 'pt')
      const exceptionsPath = path.join(sharePath, caseId, 'exceptions')
      const keysPath = path.join(basePath, 'keys')
      if(!secrets) {
        res.status(404).json({error: 'missing secret'})
      } else if (!pathValidator(pstPath) || !pathValidator(ptPath) || !pathValidator(exceptionsPath) || !pathValidator(keysPath)) {
          res.status(500).json({error: 'unable to access one of the paths'})
      } else {
          // create the secret
          // validate pw exists for each key
          // const keyRegEx = /\.key$/
          // decipherDebug(secrets)
          // decipherDebug(fs.readdirSync(keysPath).filter(f => keyRegEx.test(f)))
          // decipherDebug(fs.readdirSync(keysPath))
          // Pass secrets as env array in form 'PW_TEST=MrGlitter'
          const Env = [`PW_KEY=${secrets}`]
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
                ['./decipher.bash', pstPath, ptPath, keysPath, exceptionsPath],
                res,
                { 
                  HostConfig: { 
                    Binds: [
                    'batch-decipher-pst_hive:/app/workspace:z',
                    `${sharePath}:${sharePath}:z`,
                    ],
                    Tmpfs: {
                      '/tmp/PST': 'rw,noexec'
                    }
                  },
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
