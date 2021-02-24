import { Request, Response } from 'express'
import testCase from '../tests/data/cases'

export const getAll = (req: Request, res: Response): void => {
    res.status(200).json([testCase])
  }