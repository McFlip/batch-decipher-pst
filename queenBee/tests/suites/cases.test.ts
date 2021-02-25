/* eslint-env mocha, chai, node */
import chai, { expect } from 'chai'
import {} from 'chai-http'
import debug from 'debug'
import apiURL from '../../index'
// import utilities
import { checkCase } from '../util/checkCase'
// import data
import testCase from '../data/cases'
// import types
import myContext from '../../types/context'
import { ObjectId } from 'mongodb'

const debugCaseTest = debug('cases')
const dbName = 'decipherDB'


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
  it('should get all cases', async function () {
    const res: ChaiHttp.Response = await chai.request(apiURL).get('/cases/')
    expect(res).to.have.status(200)
    // debugCaseTest(res.body[0])
    checkCase(res.body[0], testCase)
  })
}
