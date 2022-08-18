import Head from 'next/head'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {GetServerSideProps} from 'next'
import {FormEvent, useState} from 'react'
import Menu from 'components/menu'
import debug from 'debug'
import { apiExternal, apiInternal } from 'constants/'
import axios from 'axios'

const custodiansDebug = debug('custodians')
debug.enable('custodians')

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {caseId} = context.params
  const url = `${apiInternal}:3000/cases/${caseId}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      // cache: 'no-cache',
      headers: {'Content-Type': 'application/json'}
    })
    const {custodians}: {custodians: string} = await res.json()
    return {
      props: { custodians: custodians || '', caseId }
    }
  } catch (err) {
    custodiansDebug(err)
    return { props: { custodians: '', caseId }}
  }
}

export default function Custodians({custodians, caseId}: {custodians: string, caseId: string}) {
  const [myCustodians, setMyCustodians] = useState(custodians)
  const router = useRouter()
  custodiansDebug(caseId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const url = `${apiExternal}:3000/cases/${caseId}`
    try {
      const res = await axios.patch(url, { custodians: myCustodians })
      if (res.status == 200) {
        router.push(`/${caseId}/certs`)
      }
    } catch (err) {
      custodiansDebug(err)
    }
  }

  return (
    <div className='container'>
      <Head>
        <title>Custodians</title>
      </Head>
      <main>
        <Menu currentPg='Custodians' caseId={caseId} />
        <h1>Enter Custodian emails one per line</h1>
        <p>Each line is a REGEX that will be used to filter the results of parsing the certs from signed email.</p>
        <p>Use a single period <code>.</code> to not conduct any filtering at all</p>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='myCustodians'>Custodians</label>
            <textarea id='myCustodians' className='form-control' rows={12} value={myCustodians} onChange={e => setMyCustodians(e.target.value)} />
          </div>
          <button className='btn btn-primary' type='submit'>Next</button>
        </form>
      </main>
    </div>
  )
}