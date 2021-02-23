/* eslint-env mocha, chai, node */
import {} from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'
import apiURL from '../index'
// import suites

chai.use(chaiHttp)
const expect = chai.expect

describe('API tests', function () {
  before(function (done) {
    this.apiURL = apiURL
    done()
  })
  /*
  after(function (done) {
    chai.request(apiURL)
      .delete('/mockmongoose')
      .end((err, res) => {
        if (err) console.log(err)
        res.should.have.status(200)
        done()
      })
  })
  */
  it('should return hello', async function () {
  const res = await chai.request(apiURL).get('/')
  expect(res).to.have.status(200)
  })
})