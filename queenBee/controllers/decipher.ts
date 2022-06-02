import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import dockerode from 'dockerode'
import debug from 'debug'
import { pathValidator } from '../util/pathvalidator'

const dockerAPI = new dockerode({socketPath: '/var/run/docker.sock'})
const sharePath = process.env.NODE_ENV === 'test' ? 'test_share' : '/srv/public'
const hive = process.env.NODE_ENV === 'test' ? 'test_hive' : 'batch-decipher-pst_hive'
const decipherDebug = debug('decipher')

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
    	/* istanbul ignore next */
      next(error)
  }
}

export const decipher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const {caseId}: {caseId: string} = req.body
      const {password}: {password: string} = req.body
      if (!caseId) throw new Error("no case ID");
      const basePath = path.join('/app/workspace', caseId)
      const pstPath = path.join(basePath, 'ctPSTs')
      const ptPath = path.join('/srv/public', caseId, 'pt')
      const exceptionsPath = path.join('/srv/public', caseId, 'exceptions')
      const keysPath = path.join(basePath, 'keys')
      if(!password) {
        res.status(403).json({error: 'missing password'})
      } else if (!pathValidator(pstPath) || !pathValidator(ptPath) || !pathValidator(exceptionsPath) || !pathValidator(keysPath)) {
        /* istanbul ignore next */
          throw new Error('unable to access one of the paths')
      } else {
        // pass the pw in as an ENV var to the container
        const Env = [`PW_KEY=${password}`]
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
                  `${hive}:/app/workspace:z`,
                  `${sharePath}:/srv/public:z`,
                  ],
                  Tmpfs: {
                    '/tmp/PST': 'rw,noexec'
                  }
                },
                Env
              })
              /* istanbul ignore next */
              .then(data => data[1])
        /* istanbul ignore next */
        await container.remove()
        /* istanbul ignore next */
        res.end()
      } 
  } catch (err) {
    /* istanbul ignore next */
      next(err) 
  }
}
