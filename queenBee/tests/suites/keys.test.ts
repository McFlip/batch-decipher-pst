import chai, { expect } from 'chai'
import debug from 'debug'
import apiURL from '../../index'
import fs from 'fs'
// import types
import type {} from 'mocha'
import type {} from 'chai-http'
import myContext from '../../types/context'
import { ObjectId } from 'mongodb'
import { keysRte } from '../../routes/keys'

const dbName = 'decipherDB'
const debugKeys = debug('keys')

export default function keys(this: Mocha.Suite): void {
  after(async function() {
    const { client } = this.test?.ctx as myContext
    const cases = client.db(dbName).collection('cases')
    cases.drop()
  })
  it('should extract keys from p12 containers', async function () {
    const testCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
      p12Path: '/app/workspace/p12'
    }
    // copy p12 to workspace
    fs.mkdirSync('/app/workspace/p12')
    fs.copyFileSync('/app/tests/data/p12/TEST.p12', '/app/workspace/p12/TEST.p12')
    // create test case
    const caseRes: ChaiHttp.Response = await chai.request(apiURL).post('/cases').send(testCase)
    expect(caseRes).to.have.status(201)
    const {caseId}: {caseId: ObjectId} = caseRes.body
    // extract the keys
    const secrets = [['TEST.p12', 'MrGlitter']]
    const keysRes: ChaiHttp.Response = await chai.request(apiURL).post('/keys').send({caseId, secrets})
    expect(keysRes).to.have.status(201)
    // debugKeys(keysRes.body)
    expect(keysRes.body).to.eql([[ 'TEST.p12', '12C3905B55296E401270C0CEB18B5BA660DB9A1F' ]])
  })
  it('should read key serial #s from a previous run', async function () {
    const caseRes: ChaiHttp.Response = await chai.request(apiURL).get('/cases')
    debugKeys(caseRes.body)
    const caseId: ObjectId = caseRes.body[0]?._id
    const getkeysRes: ChaiHttp.Response = await chai.request(apiURL).get(`/keys/${caseId}`)
    expect(getkeysRes).to.have.status(200)
    expect(getkeysRes.body).to.eql([[ 'TEST.p12', '12C3905B55296E401270C0CEB18B5BA660DB9A1F' ]])
  })
}
