import chai, { expect } from 'chai'
import debug from 'debug'
import apiURL from '../../index'
import fs from 'fs'
import { cleanup } from '../util/cleanup'
// import types
import type {} from 'mocha'
import type {} from 'chai-http'
import CaseType from '../../types/case'

const dbName = 'decipherDB'
const debugKeys = debug('keys')

export default function keys(this: Mocha.Suite): void {
  after(cleanup)
  it('should extract keys from p12 containers', async function () {
    const testCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
    }
    // copy p12 to workspace
    // fs.mkdirSync('/app/workspace/p12')
    // fs.copyFileSync('/app/tests/data/p12/TEST.p12', '/app/workspace/p12/TEST.p12')

    // create test case
    const caseRes: ChaiHttp.Response = await chai.request(apiURL).post('/cases').send(testCase)
    expect(caseRes).to.have.status(201)
    const { caseId }: { caseId: CaseType["_id"] } = caseRes.body
    // upload p12
    // const secrets = [['TEST.p12', 'MrGlitter']]
    // caseId, p12PW, keyPW
    const formData = {
      caseId,
      p12PW: 'MrGlitter',
      keyPW: 'MrGlitter'
    }
    const uploadRes: ChaiHttp.Response = await chai.request(apiURL)
      .post(`/keys/${caseId}`)
      .type('form')
      .attach('p12', fs.readFileSync('/app/tests/data/p12/TEST.p12'), 'TEST.p12')
      .field(formData)
      // .send(formData)
    debugKeys(uploadRes.text)
    expect(uploadRes).to.have.status(200)
    expect(uploadRes.body).to.eql(['12C3905B55296E401270C0CEB18B5BA660DB9A1F.key'])
    // extract the keys
    // const keysRes: ChaiHttp.Response = await chai.request(apiURL).post('/keys').send({caseId, secrets})
    // expect(keysRes).to.have.status(201)
    // debugKeys(keysRes.body)
    // expect(keysRes.body).to.eql([[ 'TEST.p12', '12C3905B55296E401270C0CEB18B5BA660DB9A1F' ]])
  })
  it('should read key serial #s from a previous run', async function () {
    const caseRes: ChaiHttp.Response = await chai.request(apiURL).get('/cases')
    debugKeys(caseRes.body)
    const caseId: CaseType["_id"] = caseRes.body[0]?._id
    // const caseId: ObjectId = caseRes.body[0]?._id
    const getkeysRes: ChaiHttp.Response = await chai.request(apiURL).get(`/keys/${caseId}`)
    expect(getkeysRes).to.have.status(200)
    expect(getkeysRes.body).to.eql(['12C3905B55296E401270C0CEB18B5BA660DB9A1F.key'])
  })
}
