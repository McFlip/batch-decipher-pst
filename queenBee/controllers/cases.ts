import { NextFunction, Request, Response } from 'express'
import testCase from '../tests/data/cases'
import { Case } from '../models/case'

export const create = (req: Request, res: Response, next: NextFunction): void => {
  const { name, forensicator, status } = req.body
  const myCase = new Case({ name, forensicator, status })
  myCase.save()
    .then(c => res.status(201).json({ caseId: c._id }))
    .catch(err => next(err))
}
export const getAll = (req: Request, res: Response): void => {
    res.status(200).json([testCase])
  }