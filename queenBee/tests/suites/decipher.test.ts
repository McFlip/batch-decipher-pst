import chai, { expect } from 'chai'
import debug from 'debug'
import apiURL from '../../index'
import fs from 'fs'
// import types
import type {} from 'mocha'
import type {} from 'chai-http'
import myContext from '../../types/context'
import { ObjectId } from 'mongodb'
import { decipherRte } from '../../routes/decipher'

const dbName = 'decipherDB'
const decipherDebug = debug('decipher')

export default function decipher(this: Mocha.Suite): void {
  after(async function() {
    const { client } = this.test?.ctx as myContext
    const cases = client.db(dbName).collection('cases')
    cases.drop()
  })
  it('should decipher encrypted email from pst', async function () {
    const testCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
      pstPath: '/app/workspace/pst',
      p12Path: '/app/workspace/p12',
      ptPath: '/app/workspace/pt',
      exceptionsPath: '/app/workspace/exceptions'
    }
    fs.mkdirSync('/app/workspace/pt')
    fs.mkdirSync('/app/workspace/exceptions')
    try {
       fs.accessSync('/app/workspace/pst', fs.constants.R_OK) 
    } catch (err) {
      fs.mkdirSync('/app/workspace/pst')
      fs.copyFileSync('/app/tests/data/pst/TEST.pst', '/app/workspace/pst/TEST.pst')
    }
    // repeat the key extraction test - we need the decipher to decipher
    // copy p12 to workspace
    try {
      fs.accessSync('/app/workspace/p12', fs.constants.R_OK)
    } catch (error) {
      fs.mkdirSync('/app/workspace/p12')
      fs.copyFileSync('/app/tests/data/p12/TEST.p12', '/app/workspace/p12/TEST.p12')
    }
    // create test case
    const caseRes: ChaiHttp.Response = await chai.request(apiURL).post('/cases').send(testCase)
    expect(caseRes).to.have.status(201)
    const {caseId}: {caseId: ObjectId} = caseRes.body
    // extract the keys
    let secrets = [['TEST.p12', 'MrGlitter']]
    const keysRes: ChaiHttp.Response = await chai.request(apiURL).post('/keys').send({caseId, secrets})
    expect(keysRes).to.have.status(201)
    expect(keysRes.body).to.eql([[ 'TEST.p12', '12C3905B55296E401270C0CEB18B5BA660DB9A1F' ]])
    // run decipher job
    secrets = [['12C3905B55296E401270C0CEB18B5BA660DB9A1F', 'MrGlitter']]
    const decipherRes: ChaiHttp.Response = await chai.request(apiURL).post('/decipher').send({caseId, secrets})
    expect(decipherRes).to.have.status(200)
    // read and verify output
    expect(fs.readFileSync('/app/workspace/pt/TEST/Inbox/buried/deep/down/1.eml').toString('ascii')).to.match(/NUTS!/)
  })
}
