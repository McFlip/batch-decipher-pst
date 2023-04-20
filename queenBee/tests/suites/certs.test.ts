import chai, { expect } from 'chai'
import debug from 'debug'
import apiURL from '../../index'
// import types
import type {} from 'mocha'
import type {} from 'chai-http'

const debugCerts = debug('certs')

/**
 * @description Create & Read certs in the cert archive
 * @param this certs.bind(this)
 * @todo setup & teardown functions for the database
 * @todo import db connection & schema types
 */
export default function certs(this: Mocha.Suite): void {
  it('should return status 200 if a cert exists in the DB when searching by hash', async function () {
    
  })
  it('should return status 404 if a cert is not in the DB when searching by hash', async function () {
    
  })
  it('should create a cert', async function () {
    
  })
  it('should return status 400 while creating a malformed cert', async function () {
    
  })
  it('should get all certs by email address', async function () {
    
  })
  it('should return status 400 searching by malformed email address', async function () {
    
  })
  it('should return status 404 if a cert is not in the DB when searching by email', async function () {
    
  })
}