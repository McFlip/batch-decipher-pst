/* eslint-env mocha, chai, node */
import {} from 'mocha'
import chai, { expect } from 'chai'
// import utilities
// import data
import testCase from '../data/cases'
// import types
import Context from '../../types/context'

const checkCase = (res: typeof testCase, model: typeof testCase) => {
  expect(res.name).to.eql(model.name)
  expect(res.forensicator).to.eql(model.forensicator)
  expect(res.status).to.eql(model.status)
  // TODO: check the dateCreated
}
export default function cases (): void {
  it('should get all cases', async function () {
    const { ctx } = this.test as Mocha.Test
    const { apiURL } = ctx as Context
    const res: ChaiHttp.Response = await chai.request(apiURL).get('/cases/')
    expect(res).to.have.status(200)
    checkCase(res.body[0], testCase)
  })
}
