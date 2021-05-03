import Menu from 'components/menu'
import {GetServerSideProps} from 'next'
import debug from 'debug'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const EditDebug = debug('editCase')
debug.enable('editCase')
const apiInternal = process.env.apiInternal || 'queenbee'
const apiExternal = process.env.apiExternal || 'localhost'

interface CaseType {
  _id: string,
  name: string,
  forensicator: string,
  dateCreated: string,
  status: 'active' | 'inactive',
  pstPath: string,
  p12Path: string,
  ptPath: string,
  exceptionsPath: string,
  custodians: string
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {caseId} = context.params
  const url = `http://${apiInternal}:3000/cases/${caseId}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      // cache: 'no-cache',
      headers: {'Content-Type': 'application/json'}
    })
    const fetchedCase = await res.json()
    return {
      props: { myCase: fetchedCase } // will be passed to the page component as props
    }
  } catch (err) {
    EditDebug(err)
  }
}
export default function EditCase({myCase}: {myCase: CaseType}) {
  const router = useRouter()

  const [name, setName] = useState(myCase.name)
  const [forensicator, setForensicator] = useState(myCase.forensicator)
  const [pstPath, setPstPath] = useState(myCase.pstPath)
  const [p12Path, setP12Path] = useState(myCase.p12Path)
  const [ptPath, setPtPath] = useState(myCase.ptPath)
  const [exceptionsPath, setExceptionsPath] = useState(myCase.exceptionsPath)
  const [custodians, setCustodians] = useState(myCase.custodians)
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const values = [
      ['name', name, myCase.name],
      ['forensicator', forensicator, myCase.forensicator],
      ['pstPath', pstPath, myCase.pstPath],
      ['p12Path', p12Path, myCase.p12Path],
      ['ptPath', ptPath, myCase.ptPath],
      ['exceptionsPath', exceptionsPath, myCase.exceptionsPath],
      ['custodians', custodians, myCase.custodians]
    ]
    let updates = {}
    values.filter(i => i[1] != i[2])
      .forEach(i => updates[i[0]] = i[1])
    EditDebug(updates)
    const url = `http://${apiExternal}:3000/cases/${myCase._id}`
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        mode: 'cors',
        // cache: 'no-cache',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updates)
      })
      const updatedCase = await res.json()
      EditDebug(updatedCase)
      if (updatedCase) {
        router.push(`/${myCase._id}/custodians`)
      }
    } catch (err) {
      EditDebug(err)
    }
  }

  const handleDelete = async (e: FormEvent, caseId: string) => {
    e.preventDefault()
    if(confirm('Are you sure? This cannot be undone!')) {
      const url = `http://${apiExternal}:3000/cases/${caseId}`
      try {
        const res = await fetch(url, {
          method: 'DELETE',
          mode: 'cors',
          cache: 'no-cache',
          headers: {'Content-Type': 'application/json'}
        })
        if(res.ok) {
          router.push('/')
        } else {
          alert('Failed to delete case')
        }
      } catch (err) {
        EditDebug(err)
      }
    }
  }

  return(
    <div className='container'>
      <Menu caseId={myCase._id} currentPg='Case Details' />
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='name'>Case Name:</label>
          <input id='name' type='text' className='form-control' value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='forensicator'>Forensicator:</label>
          <input id='forensicator' type='text' className='form-control' value={forensicator} onChange={e => setForensicator(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='pstPath'>PST Path:</label>
          <input id='pstPath' type='text' className='form-control' value={pstPath} onChange={e => setPstPath(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='p12Path'>p12 Path:</label>
          <input id='p12Path' type='text' className='form-control' value={p12Path} onChange={e => setP12Path(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='ptPath'>Plain Text Path:</label>
          <input id='ptPath' type='text' className='form-control' value={ptPath} onChange={e => setPtPath(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='exceptionsPath'>Exceptions Path:</label>
          <input id='exceptionsPath' type='text' className='form-control' value={exceptionsPath} onChange={e => setExceptionsPath(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='custodians'>Custodians:</label>
          <textarea id='custodians' className='form-control' rows={12} value={custodians} onChange={e => setCustodians(e.target.value)} />
        </div>
        <button className='btn btn-danger' onClick={e => handleDelete(e, myCase._id)}>Delete</button>{' '}
        <button type='submit' className='btn btn-primary'>Update</button>{' '}
        <Link href={`/${myCase._id}/custodians`}>
          <a><button className='btn btn-success'>Look's good, Continue</button></a>
        </Link>
      </form>
    </div>
  )
}