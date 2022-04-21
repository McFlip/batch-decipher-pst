import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { Case } from '../models/case'
import debug from 'debug'

const debugCase  = debug('cases')

export const create = (req: Request, res: Response, next: NextFunction): void => {
  // const { name, forensicator, status } = req.body
  // const myCase = new Case({ name, forensicator, status })
  const sharePath = '/srv/public'
  const myCase = new Case(req.body)
  myCase.save()
    .then(c => {
      const caseId = c._id.toString() as string
      const casePath = path.join('/app/workspace', caseId)
      const subDirs = ['sigs', 'sigsPSTs', 'ctPSTs', 'p12', 'keys']
      const shareSubDirs = ['pt', 'exceptions']
      fs.mkdirSync(casePath)
      subDirs.forEach(s => fs.mkdirSync(path.join(casePath, s))) 
      shareSubDirs.forEach(s => fs.mkdirSync(path.join(sharePath, caseId, s), {recursive: true}))
      res.status(201).json({ caseId: c._id })
    })
    .catch(err => next(err))
}
export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cases = await Case.find({})
    // debugCase(cases)
    res.send(cases)
  } catch (error) {
    /* istanbul ignore next */
    next(error)
  }
}
export const getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { caseId } = req.params
    const myCase = await Case.findById(caseId)
    if (!myCase) {
      res.status(404).json({error: 'Case ID not found'})
    } else {
      res.send(myCase)
    }
  } catch (error) {
    next(error)
  }
}
export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // debugCase(req.query)
    const qKeyVal = Object.entries(req.query)[0]
    const query = {[qKeyVal[0]]: { $regex: qKeyVal[1], $options: 'i' } }
    const cases = await Case.find(query)
    res.send(cases)
  } catch (error) {
    /* istanbul ignore next */
    next(error)
  }
}
export const modify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // debugCase(req.params.caseId)
    // debugCase(req.body)
    const updatedCase = await Case.findByIdAndUpdate(req.params.caseId, { $set: req.body }, { new: true, runValidators: true })
    // debugCase(updatedCase)
    if(!updatedCase) {
      res.status(404).json({error: 'Case ID not found'})
    } else {
      res.send(updatedCase)
    }
  } catch (error) {
    next(error)
  }
}
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const delCase = await Case.findByIdAndDelete(req.params.caseId)
    if(!delCase) {
      res.status(404).json({error: 'Case ID not found'})
    } else {
      fs.rmdirSync(path.join('/app/workspace', delCase._id.toString()), {recursive: true})
      res.status(200).json({ caseId: delCase._id })
    }
  } catch (error) {
    /* istanbul ignore next */
    next(error)
  }
}