/* eslint-env mocha, chai, node */
import chai, { expect } from 'chai'
import {} from 'chai-http'
import debug from 'debug'
import apiURL from '../../index'
// import utilities
// import data
import testCase from '../data/cases'
// import types
import myContext from '../../types/context'
import { ObjectId } from 'mongodb'

const debugCaseTest = debug('cases')
const dbName = 'decipherDB'

interface TestCase {
  name: string,
  forensicator: string,
  status: string,
  dateCreated?: Date
}
const checkCase = (res: TestCase, model: TestCase) => {
  expect(res.name).to.eql(model.name)
  expect(res.forensicator).to.eql(model.forensicator)
  expect(res.status).to.eql(model.status)
  expect(res?.dateCreated?.toISOString()).to.match(/\d{4}-[0-1]\d-[0-3]\dT[0-2]\d(:[0-5]\d){2}\.\d{3}Z/)
}
export default function cases (this: Mocha.Suite): void {
  after(async function() {
    const { client } = this.test?.ctx as myContext
    const cases = client.db(dbName).collection('cases')
    cases.drop()
  })
  it('should create a case', async function (): Promise<void> {
    const { client } = this.test?.ctx as myContext
    const cases = client.db(dbName).collection('cases')
    const sentCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
    }
    const res: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases/')
      .send(sentCase)
    expect(res).to.have.status(201)
    const { caseId }: { caseId: ObjectId } = res.body
    // debugCaseTest(caseId)
    const c = await cases.findOne(new ObjectId(caseId))
    checkCase(c, testCase)
  })
  it.skip('should get all cases', async function () {
    const res: ChaiHttp.Response = await chai.request(apiURL).get('/cases/')
    expect(res).to.have.status(200)
    checkCase(res.body[0], testCase)
  })
}
