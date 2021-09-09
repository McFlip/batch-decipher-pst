import Head from 'next/head'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {GetServerSideProps} from 'next'
import {FormEvent, useState} from 'react'
import Menu from 'components/menu'
import debug from 'debug'
import { apiExternal, apiInternal } from '../../constants'

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
      props: { custodians: custodians || '' }
    }
  } catch (err) {
    custodiansDebug(err)
  }
}

export default function Custodians({custodians}: {custodians: string}) {
  const [myCustodians, setMyCustodians] = useState(custodians)
  const router = useRouter()
  const {caseId}: {caseId?: string} = router.query
  custodiansDebug(caseId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const url = `${apiExternal}:3000/cases/${caseId}`
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        mode: 'cors',
        // cache: 'no-cache',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ custodians: myCustodians })
      })
      if (res.ok) {
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
        <h1>Enter Custodians one per line</h1>
        <p>Each line is a REGEX that will be used to filter the results</p>
        <p><em>PRO TIP:</em> I strongly recommend you use the EDIPI number</p>
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