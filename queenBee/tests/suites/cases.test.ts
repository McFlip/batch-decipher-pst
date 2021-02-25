/* eslint-env mocha, chai, node */
import {} from 'mocha'
import chai, { expect } from 'chai'
import { MongoClient } from 'mongodb'
import debug from 'debug'
import apiURL from '../../index'
// import utilities
// import data
import testCase from '../data/cases'
// import types
// import Context from '../../types/context'
import { ObjectId } from 'mongoose'

const debugCaseTest = debug('cases')
const dbName = 'decipherDB'
const mongoURI = `mongodb://database:27017/${dbName}`
const dbOpts = { useUnifiedTopology: true }
const client = new MongoClient(mongoURI, dbOpts)

const checkCase = (res: typeof testCase, model: typeof testCase) => {
  expect(res.name).to.eql(model.name)
  expect(res.forensicator).to.eql(model.forensicator)
  expect(res.status).to.eql(model.status)
  // TODO: check the dateCreated
}
export default function cases (this: Mocha.Suite): void {
  // debugCaseTest(this.tests)
  before(async function() {
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    debugCaseTest('Test connected to DB')
  })
  after(async function() {
    await client.close()
    const cases = client.db(dbName).collection('cases')
    cases.drop()
  })
  it('should create a case', async function (): Promise<void> {
    // debugCaseTest(this.test.ctx)
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
    cases.findOne({ _id: caseId })
      .then(returnedCase => checkCase(returnedCase, testCase))
  })
  it('should get all cases', async function () {
    const res: ChaiHttp.Response = await chai.request(apiURL).get('/cases/')
    expect(res).to.have.status(200)
    checkCase(res.body[0], testCase)
  })
}
