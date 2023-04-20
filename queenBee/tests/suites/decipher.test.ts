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

const decipherDebug = debug('decipher')

export default function decipher(this: Mocha.Suite): void {
  after(cleanup)
  it('should decipher encrypted email from pst', async function () {
    const testCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes'
    }
    // create test case
    const caseRes: ChaiHttp.Response = await chai.request(apiURL)
    .post('/cases')
    .set({'Authorization': `Bearer ${jwt}`})
    .send(testCase)
    expect(caseRes).to.have.status(201)
    const { caseId }: { caseId: CaseType["_id"] } = caseRes.body
    decipherDebug(caseId)
    // upload p12
    const formData = {
      caseId,
      p12PW: 'MrGlitter',
      keyPW: 'MrGlitter'
    }
    const p12Res: ChaiHttp.Response = await chai.request(apiURL)
      .post(`/keys/${caseId}`)
      .set({'Authorization': `Bearer ${jwt}`})
      .type('form')
      .attach('p12', fs.readFileSync('/app/tests/data/p12/TEST.p12'), 'TEST.p12')
      .field(formData)
    expect(p12Res).to.have.status(200)
    // Upload the pst
    const uploadRes: ChaiHttp.Response = await chai.request(apiURL)
      .post(`/decipher/upload/pst/${caseId}`)
      .set({'Authorization': `Bearer ${jwt}`})
      .type('form')
      .attach('pst', fs.readFileSync('/app/tests/data/pst/TEST.pst'), 'TEST.pst')
    expect(uploadRes).to.have.status(201)
    // run decipher job
    const password = 'MrGlitter'
    const decipherRes: ChaiHttp.Response = await chai.request(apiURL)
      .post('/decipher')
      .set({'Authorization': `Bearer ${jwt}`})
      .send({caseId, password})
    decipherDebug(decipherRes.text)
    expect(decipherRes).to.have.status(200)
    // read and verify output
    expect(fs.readFileSync(`/srv/public/${caseId}/pt/TEST/Inbox/buried/deep/down/1.eml`).toString('ascii')).to.match(/NUTS!/)
    // delete the uploaded PST to prep for a possible future batch
    const delRes: ChaiHttp.Response = await chai.request(apiURL)
      .delete(`/decipher/upload/pst/${caseId}`)
      .set({'Authorization': `Bearer ${jwt}`})
    expect(delRes).to.have.status(200)
    expect(fs.readdirSync(`/app/workspace/${caseId}/ctPSTs`).length).to.eq
    // run it again without pw
    const noPass: ChaiHttp.Response = await chai.request(apiURL)
      .post('/decipher')
      .set({'Authorization': `Bearer ${jwt}`})
      .send({caseId})
    expect(noPass).to.have.status(403)
  })
  it('FAILS to upload/delete ct PST with BAD caseId', async function(){
    const res404_upload: ChaiHttp.Response = await chai.request(apiURL)
      .post('/decipher/upload/pst/FUBAR')
      .set({'Authorization': `Bearer ${jwt}`})
    expect(res404_upload).to.have.status(404)
    const res500_del: ChaiHttp.Response = await chai.request(apiURL)
      .delete('/decipher/upload/pst/FUBAR')
      .set({'Authorization': `Bearer ${jwt}`})
    expect(res500_del).to.have.status(500)
    const res500_upload: ChaiHttp.Response = await chai.request(apiURL)
      .post('/decipher/upload/pst/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set({'Authorization': `Bearer ${jwt}`})
      .type('form')
      .attach('pst', fs.readFileSync('/app/tests/data/pst/TEST.pst'), 'TEST.pst')
    expect(res500_upload).to.have.status(500)
  })
}
