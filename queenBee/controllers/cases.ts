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
      next(error)
    }
  }