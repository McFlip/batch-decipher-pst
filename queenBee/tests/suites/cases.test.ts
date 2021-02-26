/* eslint-env mocha, chai, node */
import chai, { expect } from 'chai'
import debug from 'debug'
import apiURL from '../../index'
// import utilities
import { checkCase } from '../util/checkCase'
// import data
import { testCase, testInactiveCase} from '../data/cases'
// import types
import type {} from 'mocha'
import type {} from 'chai-http'
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
  it('should FAIL to create a case missing required data', async function (): Promise<void> {
    const badCase = { forensicator: 'Sherlock Holmes' }
    const res: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases')
      .send(badCase)
    expect(res).to.have.status(500)
    expect(res.text).to.match(/ValidationError: Case validation failed: name: Case name is required/)
  })
  it('should get all cases', async function () {
    const res: ChaiHttp.Response = await chai.request(apiURL).get('/cases/')
    expect(res).to.have.status(200)
    // debugCaseTest(res.body[0])
    checkCase(res.body[0], testCase)
  })
  it('should get a case by ID', async function () {
    const { client } = this.test?.ctx as myContext
    const cases = client.db(dbName).collection('cases')
    const c = await cases.findOne({ name: 'test case' })
    const res: ChaiHttp.Response = await chai.request(apiURL).get(`/cases/${c?._id}`)
    expect(res).to.have.status(200)
    checkCase(res.body, testCase)
  })
  it('should FAIL to get a case by bad ID', async function () {
    const res500: ChaiHttp.Response = await chai.request(apiURL).get('/cases/FUBAR')
    expect(res500).to.have.status(500)
    expect(res500.text).to.match(/CastError: Cast to ObjectId failed for value &quot;FUBAR&quot; at path &quot;_id&quot; for model &quot;Case&quot;/)
    const res404: ChaiHttp.Response = await chai.request(apiURL).get('/cases/aaaaaaaaaaaa')
    expect(res404).to.have.status(404)
  })
  it('should search & find the test case', async function () {
    const queries = [
      'name=test',
      'forensicator=Holmes',
      'status=active'
    ]
    const results = queries.map(async (q) => {
      // debugCaseTest(`/cases/search?${q}`)
      const res: ChaiHttp.Response = await chai.request(apiURL)
      .get(`/cases/search?${q}`)
      expect(res).to.have.status(200)
      checkCase(res.body[0], testCase)
    })
    await Promise.all(results)
  })
  it('should search & FAIL to find the test case', async function () {
    const queries = [
      'name=FUBAR',
      'forensicator=FUBAR',
      'status=inactive'
    ]
    queries.forEach(async (q) => {
      const res: ChaiHttp.Response = await chai.request(apiURL)
      .get(`/cases/search?${q}`)
      expect(res).to.have.status(200)
      expect(res.body).to.eql([])
    })
  })
  it('should filter on active cases', async function () {
    // create an inactive case
    const resInactive: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases/')
      .send(testInactiveCase)
    expect(resInactive).to.have.status(201)
    // filter
    const res: ChaiHttp.Response = await chai.request(apiURL)
      .get('/cases/search?status=active')
    expect(res).to.have.status(200)
    checkCase(res.body[0], testCase)
  })
  it('should filter on inactive cases', async function () {
    const res: ChaiHttp.Response = await chai.request(apiURL)
      .get('/cases/search?status=inactive')
    expect(res).to.have.status(200)
    checkCase(res.body[0], testInactiveCase)
  })
  it('should change case from active to inactive', async function () {
    const sentCase = {
      name: 'deactivate me',
      forensicator: 'Sherlock Holmes',
    }
    const resCreate: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases/')
      .send(sentCase)
    expect(resCreate).to.have.status(201)
    const { caseId }: { caseId: ObjectId } = resCreate.body
    // debugCaseTest(caseId)
    const resUpdate: ChaiHttp.Response = await chai.request(apiURL)
      .patch(`/cases/${caseId}`)
      .send({status: 'inactive'})
    // debugCaseTest(resUpdate.body)
    expect(resUpdate.body?.status).to.eql('inactive')
  })
  it('should FAIL to update a case with bad ID', async function () {
    const res: ChaiHttp.Response = await chai.request(apiURL)
      .patch('/cases/aaaaaaaaaaaa')
      .send({status: 'inactive'})
    expect(res).to.have.status(404)
  })
  it('should FAIL to update with bad value', async function () {
    const sentCase = {
      name: 'deactivate me',
      forensicator: 'Sherlock Holmes',
    }
    const resCreate: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases/')
      .send(sentCase)
    expect(resCreate).to.have.status(201)
    const { caseId }: { caseId: ObjectId } = resCreate.body
    // debugCaseTest(caseId)
    const resUpdate: ChaiHttp.Response = await chai.request(apiURL)
      .patch(`/cases/${caseId}`)
      .send({status: 'FUBAR'})
    expect(resUpdate).to.have.status(500)
    expect(resUpdate.text).to.match(/<pre>ValidationError: Validation failed: status: `FUBAR` is not a valid enum value for path `status`/)
  })
}
