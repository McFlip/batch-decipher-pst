import chai, { expect } from 'chai'
import debug from 'debug'
import apiURL from '../../index'
import fs from 'fs'
import path from 'path'
// import types
import type {} from 'mocha'
import type {} from 'chai-http'
import CaseType from '../../types/case'

const debugSig = debug('sig')

export default function sigs(this: Mocha.Suite): void {
  after(async function() {
    const caseDirs = fs.readdirSync('/app/workspace')
    caseDirs.forEach((folder) => {
      fs.rmSync(path.join('/app/workspace', folder), { recursive: true, force: true })
    })
  })
  it('should get custodian cert info from signed emails', async function () {
    // Create a test case
    const testCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
    }
    const createdRes: ChaiHttp.Response = await chai.request(apiURL).post('/cases').send(testCase)
    expect(createdRes).to.have.status(201)
    const { caseId }: { caseId: CaseType["_id"] } = createdRes.body
    debugSig(caseId)
    // Upload the pst
    const uploadRes: ChaiHttp.Response = await chai.request(apiURL)
      .post(`/sigs/upload/${caseId}`)
      .type('form')
      .attach('pst', fs.readFileSync('/app/tests/data/pst/TEST.pst'), 'TEST.pst')
    expect(uploadRes).to.have.status(201)
    // Custodian list
    const setCustodiansRes: ChaiHttp.Response = await chai.request(apiURL)
      .patch(`/cases/${caseId}`)
      .send({custodians: '12345678'})
    expect(setCustodiansRes).to.have.status(200)
    // Run getSigs
    const getSigsRes: ChaiHttp.Response = await chai.request(apiURL).post('/sigs').send({caseId})
    expect(getSigsRes).to.have.status(200)
    debugSig('DUUUUUUUUUUUUUUUUUVAAALLL!!!!')
    debugSig(getSigsRes.text)
    expect(getSigsRes.text).to.contain("3 items done, 0 items skipped")
    expect(getSigsRes.text).to.contain("Failed to get cert for:\r\n /tmp/PST/TEST/Inbox/buried/deep/down/1.eml\r\n")
    expect(getSigsRes.text).to.contain("serial=12C3905B55296E401270C0CEB18B5BA660DB9A1F\r\n")
  })
  it('should FAIL to process emails with a bad case id', async function () {
    const res404: ChaiHttp.Response = await chai.request(apiURL).post('/sigs').send({caseId: 'aaaaaaaaaaaaaaaaaaaaaaaa'})
    expect(res404).to.have.status(404)
  })
  it('should FAIL to process email with no case id', async function () {
    const res500: ChaiHttp.Response = await chai.request(apiURL).post('/sigs').send({})
    expect(res500).to.have.status(500)
  })
  it('should read certs from an already processed case', async function () {
    const caseRes: ChaiHttp.Response = await chai.request(apiURL).get('/cases')
    const caseId: CaseType["_id"] = caseRes.body[0]?._id
    debugSig('getting cert...')
    debugSig(caseId)
    const getCertsRes: ChaiHttp.Response = await chai.request(apiURL).get(`/sigs/${caseId}`)
    debugSig(getCertsRes.text)
    expect(getCertsRes).to.have.status(200)
    expect(getCertsRes.text).to.eql(fs.readFileSync('/app/tests/data/allCerts.txt').toString("ascii"))
  })
  it('should FAIL to read certs with a bad case id', async function () {
    const getCertsRes: ChaiHttp.Response = await chai.request(apiURL).get('/sigs/aaaaaaaaaaaaaaaaaaaaaaa')
    debugSig(getCertsRes.text)
    expect(getCertsRes).to.have.status(404)
  })
  it('should FAIL to process emails with no custodian list', async function () {
    const testCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
      custodians: ''
    }
    const createdRes: ChaiHttp.Response = await chai.request(apiURL).post('/cases').send(testCase)
    expect(createdRes).to.have.status(201)
    const { caseId }: { caseId: CaseType["_id"] } = createdRes.body
    const getSigsRes: ChaiHttp.Response = await chai.request(apiURL).post('/sigs').send({caseId})
    expect(getSigsRes).to.have.status(500)
  })
}