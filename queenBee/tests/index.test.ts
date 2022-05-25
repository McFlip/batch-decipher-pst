/* eslint-env mocha, chai, node */
import type {} from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'
import apiURL from '../index' // Comment out if using URL string
import cases from './suites/cases.test'
// import sigs from './suites/sigs.test'
// import keys from './suites/keys.test'
// import decipher from './suites/decipher.test'
import fs from 'fs'
import path from 'path'

chai.use(chaiHttp)
const expect = chai.expect

describe('API tests', function () {
  after(async function () {
    // clean up filesystem
    interface rmOpts {
      recursive: boolean,
      force: boolean
    }
    const caseDirs = fs.readdirSync('/app/workspace')
    caseDirs.forEach((folder) => {
      fs.rmSync(path.join('/app/workspace', folder), { recursive: true, force: true } as rmOpts)
    })
  })
  it('should return hello', async function () {
    const res = await chai.request(apiURL).get('/')
    expect(res).to.have.status(200)
  })
  describe('CASES', cases.bind(this))
  // describe('Get CERTS from signed email', sigs.bind(this))
  // describe('Extract and decrypt KEYS from p12', keys.bind(this))
  // describe('Decipher', decipher.bind(this))
})