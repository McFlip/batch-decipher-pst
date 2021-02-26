import { NextFunction, Request, Response } from 'express'
import { Case } from '../models/case'
import debug from 'debug'

const debugCase  = debug('cases')

export const create = (req: Request, res: Response, next: NextFunction): void => {
  const { name, forensicator, status } = req.body
  const myCase = new Case({ name, forensicator, status })
  myCase.save()
    .then(c => res.status(201).json({ caseId: c._id }))
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