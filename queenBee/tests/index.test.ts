/* eslint-env mocha, chai, node */
import type {} from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'
import apiURL from '../index' // Comment out if using URL string
import cases from './suites/cases.test'
import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'

chai.use(chaiHttp)
const expect = chai.expect
const dbName = 'decipherDB'
const mongoURI = `mongodb://database:27017/${dbName}`
const dbOpts = { useUnifiedTopology: true }
const client = new MongoClient(mongoURI, dbOpts)

describe('API tests', function () {
  before(async function () {
    // In DEV, set apiURL to actual app
    // If using Staging env, add logic to check env & get URL string for staging
    // this.apiURL = apiURL as Express.Application
    // set up database connection
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    this.client = client
  })
  after(async function () {
    // close db connection
    client.close()
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
  describe('CASES tests', cases.bind(this))
})