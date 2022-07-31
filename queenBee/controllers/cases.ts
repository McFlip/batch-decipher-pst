import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import debug from 'debug'
import CaseType from '../types/case'

const debugCase  = debug('cases')

// Helper func to get all cases as an array of obj
const getCases = (): CaseType[] => {
  const rootPath = '/app/workspace'
  return fs.readdirSync(rootPath)
    .map(myDir => path.join(rootPath, myDir, 'case.json'))
    .map(myPath => JSON.parse(fs.readFileSync(myPath).toString()))
}
// Helper func to get one case
const getCase = (caseId: string): CaseType => {
  if (!caseId.match(/[0-9,a-f]{24}/)) {
    throw new Error('Invalid Case ID')
  }
  const myCase = path.join('/app/workspace', caseId, 'case.json')
  if (!fs.existsSync(myCase)) {
    throw new Error('Case ID not found')
  } else {
    return JSON.parse(fs.readFileSync(myCase).toString())
  }
}

export const create = (req: Request, res: Response, next: NextFunction): void => {
  const { name, forensicator, custodians } = req.body
  // validation
  if (!name) {
    const error = new Error('ValidationError: Case name is required')
    return next(error)
  } else if (!forensicator) {
    const error = new Error('ValidationError: Forensicator is required')
    return next(error)
  }
  // path structure
  // const sharePath = process.env.NODE_ENV === 'test' ? 'test_share' : '/srv/public'
  const sharePath = '/srv/public'
  const subDirs = ['sigs', 'sigsPSTs', 'ctPSTs', 'p12', 'keys']
  const shareSubDirs = ['pt', 'exceptions']
  // generate a unique id for the case
  let _id = crypto.randomBytes(12).toString('hex')
  let casePath = path.join('/app/workspace', _id)
  /* istanbul ignore next */
  while (fs.existsSync(casePath)) {
    _id = crypto.randomBytes(12).toString('hex')
    casePath = path.join('/app/workspace', _id)
  }
  // create the case file and scaffold folders
  const myCase: CaseType = {
    _id,
    name,
    forensicator,
    dateCreated: Date(),
    custodians
  }
  try {
    fs.mkdirSync(casePath)
    subDirs.forEach(s => fs.mkdirSync(path.join(casePath, s))) 
    shareSubDirs.forEach(s => fs.mkdirSync(path.join(sharePath, _id, s), {recursive: true}))
    fs.writeFileSync(`${casePath}/case.json`, JSON.stringify(myCase))
  } catch (error) {
    /* istanbul ignore next */
    return next(error)
  }
  res.status(201).json({ caseId: _id })
}
export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cases = getCases()
    // debugCase(JSON.stringify(cases))
    res.send(cases)
  } catch (error) {
    /* istanbul ignore next */
    next(error)
  }
}
export const getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { caseId } = req.params
    res.send(getCase(caseId))
  } catch (error) {
    /* istanbul ignore next */
    const message = error instanceof Error ? error.message : String(error)
    if (message === 'Case ID not found') {
      res.status(404).json({error: 'Case ID not found'})
    } else {
      next(error)
    }
  }
}
export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // search by either name(default) or forensicator
    // empty query returns all
    // debugCase(req.query)
    const { name, forensicator } = req.query
    const cases = getCases()
    const searchStr = name || forensicator
    const searchProp = name ? "name" : "forensicator"
    if (searchStr) {
      const searchRegEx = new RegExp(searchStr as string, 'i')
      res.send(cases.filter(c => searchRegEx.test(c[searchProp])))
    } else {
      res.send(cases)
    }
  } catch (error) {
    /* istanbul ignore next */
    next(error)
  }
}
export const modify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { caseId } = req.params
    const { name, forensicator, custodians } = req.body
    const myCase = getCase(caseId)
    const { _id, dateCreated } = myCase
    const casePath = path.join('/app/workspace', caseId, 'case.json')
    const newData = {
      _id,
      dateCreated,
      name: name || myCase.name,
      forensicator: forensicator || myCase.forensicator,
      custodians: custodians || myCase.custodians
    }
    // debugCase(newData)
    fs.writeFileSync(casePath, JSON.stringify(newData))
    res.send(newData)
  } catch (error) {
    /* istanbul ignore next */
    const message = error instanceof Error ? error.message : String(error)
    if (message === 'Case ID not found') {
      res.status(404).json({error: 'Case ID not found'})
    } else {
      /* istanbul ignore next */
      next(error)
    }
  }
}
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { caseId } = req.params
    // verify case exists & sanitize input
    const myCase = getCase(caseId)
    fs.rmSync(path.join('/app/workspace', myCase._id), {recursive: true})
    res.status(200).json({ caseId })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    /* istanbul ignore next */
    if (message === 'Case ID not found') {
      res.status(404).json({error: 'Case ID not found'})
    } else {
      /* istanbul ignore next */
      next(error)
    }
  }
}