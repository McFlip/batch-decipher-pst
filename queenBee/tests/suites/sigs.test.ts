import chai, { expect } from 'chai'
import debug from 'debug'
import apiURL from '../../index'
import fs from 'fs'
// import types
import type {} from 'mocha'
import type {} from 'chai-http'
import myContext from '../../types/context'
import { ObjectId } from 'mongodb'

const dbName = 'decipherDB'
const debugSig = debug('sig')

export default function sigs(this: Mocha.Suite): void {
  after(async function() {
    const { client } = this.test?.ctx as myContext
    const cases = client.db(dbName).collection('cases')
    cases.drop()
  })
  it('should get custodian cert info from signed emails', async function () {
    // Create a test case
    const testCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
    }
    const createdRes: ChaiHttp.Response = await chai.request(apiURL).post('/cases').send(testCase)
    expect(createdRes).to.have.status(201)
    const { caseId }: { caseId: ObjectId } = createdRes.body
    debugSig(caseId)
    // Copy the pst
    fs.mkdirSync('/app/workspace/pst')
    fs.copyFileSync('/app/tests/data/pst/TEST.pst', '/app/workspace/pst/TEST.pst')
    // Set the pst path
    const setPstRes: ChaiHttp.Response = await chai.request(apiURL)
      .patch(`/cases/${caseId}`)
      .send({pstPath: '/app/workspace/pst'})
    expect(setPstRes).to.have.status(200)
    // Custodian list
    const setCustodiansRes: ChaiHttp.Response = await chai.request(apiURL)
      .patch(`/cases/${caseId}`)
      .send({custodians: '12345678'})
    expect(setCustodiansRes).to.have.status(200)
    // Run getSigs
    const getSigsRes: ChaiHttp.Response = await chai.request(apiURL).post('/sigs').send({caseId})
    expect(getSigsRes).to.have.status(201)
    expect(getSigsRes.text).to.eql(fs.readFileSync('/app/tests/data/allCerts.txt').toString("ascii"))
  })
  it('should read certs from an already processed case', async function () {
    const caseRes: ChaiHttp.Response = await chai.request(apiURL).get('/cases')
    const caseId: ObjectId = caseRes.body[0]?._id
    const getCertsRes: ChaiHttp.Response = await chai.request(apiURL).get(`/sigs/${caseId}`)
    expect(getCertsRes).to.have.status(200)
    expect(getCertsRes.text).to.eql(fs.readFileSync('/app/tests/data/allCerts.txt').toString("ascii"))
  })
}