import Head from 'next/head'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {FormEvent, useState} from 'react'
import debug from 'debug'

export default function NewCase () {
  const router = useRouter()
  const newCaseDebug = debug('newcase')
  const [forensicator, setForensicator] = useState('Player1')
  const [caseName, setCaseName] = useState('Case1')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // const url = 'http://queenbee:3000/cases'
    const url = 'http://localhost:3000/cases'
    const body = JSON.stringify({name: caseName, forensicator})
    try {
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {'Content-Type': 'application/json'},
        body
      })
      // console.log(res)
      const {caseId} = await res.json()
      // console.log(caseId)
      newCaseDebug(caseId)
      router.push(`${caseId}/custodians`)
    } catch (err) {
      newCaseDebug(err)
    }
  }
  return(
    <div className='container'>
      <Head>
        <title>Create case</title>
      </Head>
      <main>
        <h1>Create a new case</h1>
        <h2>All fields required</h2>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='forensicator'>Forensicator: </label>
            <input id='forensicator' type='text' className='form-control' value={forensicator} onChange={e => setForensicator(e.target.value)}/>
          </div>
          <div className='form-group'>
            <label htmlFor='casename'>Case Name: </label>
            <input id='casename' type='text' className='form-control' value={caseName} onChange={e => setCaseName(e.target.value)} />
          </div>
          <button type='submit' className='btn btn-success'>Create</button>
        </form>
      </main>
    </div>
  )
}