import chai, { expect } from 'chai'
import debug from 'debug'
import apiURL from '../../index'
import fs from 'fs'
import { cleanup } from '../util/cleanup'
// import types
import type {} from 'mocha'
import type {} from 'chai-http'
import CaseType from '../../types/case'
import jwt from '../data/jwt'

const debugKeys = debug('keys')

export default function keys(this: Mocha.Suite): void {
  after(cleanup)
  it('should extract keys from p12 containers', async function () {
    const testCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
    }
    // create test case
    const caseRes: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases')
      .set({'Authorization': `Bearer ${jwt}`})
      .send(testCase)
    expect(caseRes).to.have.status(201)
    const { caseId }: { caseId: CaseType["_id"] } = caseRes.body
    // upload p12
    const formData = {
      caseId,
      p12PW: 'MrGlitter',
      keyPW: 'MrGlitter'
    }
    const uploadRes: ChaiHttp.Response = await chai.request(apiURL)
      .post(`/keys/${caseId}`)
      .set({'Authorization': `Bearer ${jwt}`})
      .type('form')
      .attach('p12', fs.readFileSync('/app/tests/data/p12/TEST.p12'), 'TEST.p12')
      .field(formData)
    debugKeys(uploadRes.text)
    expect(uploadRes).to.have.status(200)
    expect(uploadRes.body).to.eql(['12C3905B55296E401270C0CEB18B5BA660DB9A1F.key'])
  })
  it('should read key serial #s from a previous run', async function () {
    const caseRes: ChaiHttp.Response = await chai.request(apiURL)
      .get('/cases')
      .set({'Authorization': `Bearer ${jwt}`})
    debugKeys(caseRes.body)
    const caseId: CaseType["_id"] = caseRes.body[0]?._id
    const getkeysRes: ChaiHttp.Response = await chai.request(apiURL)
      .get(`/keys/${caseId}`)
      .set({'Authorization': `Bearer ${jwt}`})
    expect(getkeysRes).to.have.status(200)
    expect(getkeysRes.body).to.eql(['12C3905B55296E401270C0CEB18B5BA660DB9A1F.key'])
  })
  it('should FAIL to extract a key with a BAD password', async function () {
    const testCase = {
      name: 'Bad LT',
      forensicator: 'Nicolas Cage',
    }
    // create test case
    const caseRes: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases')
      .set({'Authorization': `Bearer ${jwt}`})
      .send(testCase)
    expect(caseRes).to.have.status(201)
    const { caseId }: { caseId: CaseType["_id"] } = caseRes.body
    // upload p12
    const formData = {
      caseId,
      p12PW: 'fubar',
      keyPW: 'fubar'
    }
    const uploadRes: ChaiHttp.Response = await chai.request(apiURL)
      .post(`/keys/${caseId}`)
      .set({'Authorization': `Bearer ${jwt}`})
      .type('form')
      .attach('p12', fs.readFileSync('/app/tests/data/p12/TEST.p12'), 'TEST.p12')
      .field(formData)
    debugKeys(uploadRes.text)
    expect(uploadRes).to.have.status(500)
    expect(uploadRes.text).to.contain('Error: Mac verify error: invalid password?')
  })
  it('should FAIL to extract a key with a BAD caseId', async function () {
    const formData = {
      caseId: 'fubar',
      p12PW: 'fubar',
      keyPW: 'fubar'
    }
    const res: ChaiHttp.Response = await chai.request(apiURL)
      .post('/keys/fubar')
      .set({'Authorization': `Bearer ${jwt}`})
      .type('form')
      .attach('p12', fs.readFileSync('/app/tests/data/p12/TEST.p12'), 'TEST.p12')
      .field(formData)
    debugKeys(res.text)
    expect(res).to.have.status(500)
  })
  it('should FAIL to get serails with a BAD caseId', async function () {
    const getkeysRes: ChaiHttp.Response = await chai.request(apiURL)
      .get(`/keys/fubar}`)
      .set({'Authorization': `Bearer ${jwt}`})
    expect(getkeysRes).to.have.status(500)
  })
  it('should FAIL to extract a key with missing form data', async function () {
    const testCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
    }
    // create test case
    const caseRes: ChaiHttp.Response = await chai.request(apiURL)
    .post('/cases')
    .set({'Authorization': `Bearer ${jwt}`})
    .send(testCase)
    expect(caseRes).to.have.status(201)
    const { caseId }: { caseId: CaseType["_id"] } = caseRes.body
    const fakeId = 'fubar'
    const p12PW = 'fubar'
    const keyPW = 'fubar'
    const noId = {p12PW,keyPW}
    const noP12 = {fakeId,keyPW}
    const noKey = {fakeId,p12PW}
    const forms = [noId,noP12,noKey]
    forms.forEach(async (f) => {
      const res: ChaiHttp.Response = await chai.request(apiURL)
        .post(`/keys/${caseId}`)
        .set({'Authorization': `Bearer ${jwt}`})
        .type('form')
        .field(f)
      expect(res).to.have.status(500)
      debugKeys(res.status)
    })
  })
}
