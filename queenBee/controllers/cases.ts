import { Request, Response } from 'express'

export const getCases = (req: Request, res: Response): void => {
    res.status(200).send('Hello from cases!\r\n')
  }