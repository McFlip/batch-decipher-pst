/* eslint-env mocha, chai, node */
import {} from 'mocha'
import chai, { expect } from 'chai'
import { MongoClient } from 'mongodb'
// import utilities
// import data
import testCase from '../data/cases'
// import types
import Context from '../../types/context'
import { Collection, Document, ObjectId } from 'mongoose'

const dbName = 'decipherDB'
const mongoURI = `mongodb+srv://database:27017${dbName}`
const client = new MongoClient(mongoURI)

const checkCase = (res: typeof testCase, model: typeof testCase) => {
  expect(res.name).to.eql(model.name)
  expect(res.forensicator).to.eql(model.forensicator)
  expect(res.status).to.eql(model.status)
  // TODO: check the dateCreated
}
export default async function cases (this: Mocha.Suite): Promise<void> {
  const { ctx } = this
  const { apiURL } = ctx as Context
  const cases = client.db(dbName).collection('cases')

  before(async function() {
    await client.connect()
    await client.db("admin").command({ ping: 1 })
  })
  after(async function() {
    await client.close()
  })
  it('should create a case', async function (): Promise<void> {
    const sentCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
    }
    const res: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases/')
      .send(sentCase)
    expect(res).to.have.status(201)
    const { caseId }: { caseId: ObjectId } = res.body
    const returnedCase = await cases.findOne({ _id: caseId })
    checkCase(returnedCase, testCase)
  })
  it('should get all cases', async function () {
    const res: ChaiHttp.Response = await chai.request(apiURL).get('/cases/')
    expect(res).to.have.status(200)
    checkCase(res.body[0], testCase)
  })
}
