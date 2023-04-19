import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'
import debug from 'debug'
import Menu from 'components/menu'
import { apiExternal } from 'constants/'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import Isession from 'types/session'

export default function NewCase() {
  const router = useRouter()
  const newCaseDebug = debug('newcase')
  const [forensicator, setForensicator] = useState('Player1')
  const [caseName, setCaseName] = useState('Case1')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const url = `${apiExternal}:3000/cases`
    if (!forensicator) return alert('Missing Forensicator')
    if (!caseName) return alert('Missing Case Name')
    try {
      const { apiKey } = await getSession() as Isession
      const config = {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      }
      const res = await axios.post(url, { name: caseName, forensicator }, config)
      const { caseId } = await res.data
      newCaseDebug(caseId)
      router.push(`${caseId}/custodians`)
    } catch (err) {
      newCaseDebug(err)
    }
  }
  return (
    <div className='container'>
      <Head>
        <title>Create case</title>
      </Head>
      <main>
        <Menu currentPg='Case Details' />
        <h1>Create a new case</h1>
        <h2>All fields required</h2>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='forensicator'>Forensicator: </label>
            <input id='forensicator' type='text' className='form-control' value={forensicator} onChange={e => setForensicator(e.target.value)} />
          </div>
          <div className='form-group'>
            <label htmlFor='casename'>Case Name: </label>
            <input id='casename' type='text' className='form-control' value={caseName} onChange={e => setCaseName(e.target.value)} />
          </div>
          <button type='submit' className='btn btn-success'>Create</button>
          <Link href='/'><a><button className='btn btn-danger'>Cancel</button></a></Link>
        </form>
      </main>
    </div>
  )
}