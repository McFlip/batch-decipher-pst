import Menu from 'components/menu'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {GetServerSideProps} from 'next'
import {FormEvent, useState} from 'react'
import debug from 'debug'

const CertsDebug = debug('certs')
debug.enable('certs')

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {caseId} = context.params
  const url = `http://queenbee:3000/cases/${caseId}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      // cache: 'no-cache',
      headers: {'Content-Type': 'application/json'}
    })
    const {pstPath}: {pstPath: string} = await res.json()
    if (!pstPath) return { props: { pstPath: '' } }
    return {
      props: { pstPath }
    }
  } catch (err) {
    CertsDebug(err)
  }
}

interface propsType {
  pstPath: string
}

export default function Certs (props: propsType) {
  const router = useRouter()
  const {caseId}: {caseId?: string} = router.query
  const [pstPath, setPstPath] = useState(props.pstPath)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const url = `http://localhost:3000/cases/${caseId}`
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        mode: 'cors',
        // cache: 'no-cache',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ pstPath })
      })
      if (res.ok) {
        alert('Path is valid')
      }
    } catch (err) {
      CertsDebug(err)
      alert('Path is not valid')
    }
  }

  return(
    <div className='container'>
      <Head>
        <title>Get Cert Info</title>
      </Head>
      <main>
        <Menu currentPg='Get Cert Info' caseId={caseId} />
        <h1>Set input PST path</h1>
        <p>Set the path before running to ensure propper permissions</p>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='pstPath'>PST Path</label>
            <input id='pstPath' type='text' className='form-control' value={pstPath} onChange={e => setPstPath(e.target.value)} />
          </div>
          <button type='submit' className='btn btn-info'>Set Path & Validate</button>
        </form>
        <h2>Launch Script</h2>
      </main>
    </div>
  )
}