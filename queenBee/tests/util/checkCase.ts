// Deep equal assertion on case, except for dateCreated which is checked with regex
import { expect } from 'chai'
import debug from 'debug'

const checkCaseDebug = debug('cases')

interface TestCase {
  name: string,
  forensicator: string,
  dateCreated?: Date
}

export const checkCase = (res: TestCase, model: TestCase): void => {
  expect(res.name).to.eql(model.name)
  expect(res.forensicator).to.eql(model.forensicator)
  const myDate = (typeof res?.dateCreated == 'string') ? res?.dateCreated : res?.dateCreated?.toISOString()
  expect(myDate).to.match(/([A-Z][a-z]{2,} ){2}\d{1,2} \d{4} (\d{1,2}:){2}\d{1,2} [A-Z]{3}[+-]\d{4}/)
}
