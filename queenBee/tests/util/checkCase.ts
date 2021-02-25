// Deep equal assertion on case, except for dateCreated which is checked with regex
import { expect } from 'chai'
import debug from 'debug'

const checkCaseDebug = debug('cases')

interface TestCase {
  name: string,
  forensicator: string,
  status: string,
  dateCreated?: Date
}

export const checkCase = (res: TestCase, model: TestCase): void => {
  expect(res.name).to.eql(model.name)
  expect(res.forensicator).to.eql(model.forensicator)
  expect(res.status).to.eql(model.status)
  checkCaseDebug(typeof res?.dateCreated)
  const myDate = (typeof res?.dateCreated == 'string') ? res?.dateCreated : res?.dateCreated?.toISOString()
  expect(myDate).to.match(/\d{4}-[0-1]\d-[0-3]\dT[0-2]\d(:[0-5]\d){2}\.\d{3}Z/)
}
