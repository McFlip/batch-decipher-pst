/* eslint-env mocha, chai, node */
import chai, { expect } from 'chai'
import debug from 'debug'
import apiURL from '../../index'
import path from 'path'
import fs from 'fs'
// import utilities
import { checkCase } from '../util/checkCase'
import {pathValidator} from '../../util/pathvalidator'
// import data
import { testCase } from '../data/cases'
// import types
import type {} from 'mocha'
import type {} from 'chai-http'

const debugCaseTest = debug('cases')
const getCase = () => {
  // path to case file is /app/workspace/*/case.json
  const caseData = fs.readFileSync(path.join('/app/workspace', fs.readdirSync('/app/workspace')[0], 'case.json')).toString()
  return JSON.parse(caseData)
}

export default function cases (this: Mocha.Suite): void {
  it('should create a case', async function (): Promise<void> {
    const sentCase = {
      name: 'test case',
      forensicator: 'Sherlock Holmes',
    }
    const res: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases/')
      .send(sentCase)
    expect(res).to.have.status(201)
    const c = getCase()
    checkCase(c, testCase)
    // Test folder structure
    const subDirs = ['sigs', 'p12', 'keys']
    const isDirExist = subDirs.map(d => pathValidator(path.join('/app/workspace',c._id.toString(),d)))
      .reduce((prev, curr) => prev && curr)
    expect(isDirExist).to.eql(true)
  })
  it('should FAIL to create a case missing required data', async function (): Promise<void> {
    const badCase = { forensicator: 'Sherlock Holmes' }
    const res: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases')
      .send(badCase)
    expect(res).to.have.status(500)
    expect(res.text).to.match(/ValidationError: Case name is required/)
    const badCase2 = { name: 'missing forensicator' }
    const res2: ChaiHttp.Response = await chai.request(apiURL)
      .post('/cases')
      .send(badCase2)
    expect(res2).to.have.status(500)
    expect(res2.text).to.match(/ValidationError: Forensicator is required/)
  })
  it('should get all cases', async function () {
    const res: ChaiHttp.Response = await chai.request(apiURL).get('/cases/')
    expect(res).to.have.status(200)
    // debugCaseTest(res.body)
    checkCase(res.body[0], testCase)
  })
  it('should get a case by ID', async function () {
    const c = getCase()
    const res: ChaiHttp.Response = await chai.request(apiURL).get(`/cases/${c?._id}`)
    expect(res).to.have.status(200)
    checkCase(res.body, testCase)
  })
  it('should FAIL to get a case by bad ID', async function () {
    const res500: ChaiHttp.Response = await chai.request(apiURL).get('/cases/FUBAR')
    expect(res500).to.have.status(500)
    expect(res500.text).to.contain("Invalid Case ID")
    const res404: ChaiHttp.Response = await chai.request(apiURL).get('/cases/aaaaaaaaaaaaaaaaaaaaaaaa')
    expect(res404).to.have.status(404)
  })
  it('should search & find the test case', async function () {
    const queries = [
      'name=test',
      'forensicator=Holmes',
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
      'forensicator=FUBAR'
    ]
    queries.forEach(async (q) => {
      const res: ChaiHttp.Response = await chai.request(apiURL)
      .get(`/cases/search?${q}`)
      expect(res).to.have.status(200)
      expect(res.body).to.eql([])
    })
  })
  it('should FAIL to update a case with bad ID', async function () {
    const res: ChaiHttp.Response = await chai.request(apiURL)
      .patch('/cases/aaaaaaaaaaaaaaaaaaaaaaaa')
      .send({status: 'inactive'})
    expect(res).to.have.status(404)
  })
  it('should FAIL to update with bad value', async function () {
    const c = getCase()
    const resUpdate: ChaiHttp.Response = await chai.request(apiURL)
      .patch(`/cases/${c?._id}`)
      .send({forensicator: ''})
    expect(resUpdate).to.have.status(200)
    const { name, forensicator } = resUpdate.body
    expect(name).to.eql('test case')
    expect(forensicator).to.eql('Sherlock Holmes')
    // expect(resUpdate.text).to.match(/<pre>ValidationError: Forensicator is required/)
  })
  it('should delete a case by ID', async function () {
    const c = getCase()
    const resDel: ChaiHttp.Response = await chai.request(apiURL).delete(`/cases/${c?._id}`)
    expect(resDel).to.have.status(200)
    const { caseId: deletedId } = resDel.body
    const resGet: ChaiHttp.Response = await chai.request(apiURL).get(`/cases/${deletedId}`)
    expect(resGet).to.have.status(404)
    // Delete workspace
    const subDirs = ['sigs', 'p12', 'keys']
    const isDirExist = subDirs.map(d => pathValidator(path.join('/app/workspace',deletedId.toString(),d)))
      .reduce((prev, curr) => prev || curr)
    expect(isDirExist).to.eql(false)
  })
  it('should FAIL to delete a case with a bad ID', async function () {
    const res: ChaiHttp.Response = await chai.request(apiURL).delete('/cases/aaaaaaaaaaaaaaaaaaaaaaaa')
    expect(res).to.have.status(404)
  })
}
