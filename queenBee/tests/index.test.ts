/* eslint-env mocha, chai, node */
import {} from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'
import apiURL from '../index' // Comment out if using URL string
import cases from './suites/cases.test'

chai.use(chaiHttp)
const expect = chai.expect

describe('API tests', function () {
  before(function (done) {
    // In DEV, set apiURL to actual app
    // If using Staging env, add logic to check env & get URL string for staging
    this.apiURL = apiURL as Express.Application
    this.fubar = 'baz'
    done()
  })
  after(function (done) {
    done()
  })
  it('should return hello', async function () {
    const res = await chai.request(apiURL).get('/')
    expect(res).to.have.status(200)
  })
  describe('CASES tests', cases.bind(this))
})