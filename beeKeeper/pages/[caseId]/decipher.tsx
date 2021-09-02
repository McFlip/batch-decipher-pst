import Menu from 'components/menu'
import SetPath from 'components/setpath'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {GetServerSideProps} from 'next'
import { FormEvent, MouseEvent, useState } from 'react'
import debug from 'debug'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Alert from 'react-bootstrap/Alert'

const DecipherDebug = debug('decipher')
debug.enable('decipher')
const apiInternal = process.env.API_INTERNAL || 'localhost'
const apiExternal = process.env.NEXT_PUBLIC_API_EXTERNAL || 'localhost'

type SerialsType = [string, string][]
interface caseType {
  pstPath: string,
  ptPath: string,
  exceptionsPath: string,
  serialsProp?: SerialsType
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {caseId} = context.params
  const urlCase = `${apiInternal}:3000/cases/${caseId}`
  const urlKeys = `${apiInternal}:3000/keys/${caseId}`
  try {
    const fetchCase = fetch(urlCase, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      headers: {'Content-Type': 'application/json'}
    })
    const fetchSerials = fetch(urlKeys, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      headers: {'Content-Type': 'application/json'}
    })
    const [resCase, resSerials] = await Promise.all([fetchCase, fetchSerials])
    const caseMeta = await resCase.json() as caseType
    let paths = [ caseMeta.pstPath, caseMeta.ptPath, caseMeta.exceptionsPath ].map(p => p || '')
    let [ pstPath, ptPath, exceptionsPath ] = paths
    const serials: SerialsType = resSerials.ok ? await resSerials.json() : [['','']]
    return {
      props: { pstPath, ptPath, exceptionsPath, serialsProp: serials }
    }
  } catch (err) {
    DecipherDebug(err)
    return { props: { p12Path: JSON.stringify(err) }}
  }
}

export default function Keys ({ pstPath, ptPath, exceptionsPath, serialsProp }: caseType) {
  const router = useRouter()
  const {caseId}: {caseId?: string} = router.query
  const [serials, setSerials] = useState(serialsProp)
  const [serial, setSerial] = useState(serialsProp[0][1])
  const [password, setPassword] = useState('')
  const [secrets, setSecrets] = useState([['','']])
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState(0)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    DecipherDebug('wtf')
    const newSecrets = [...secrets, [serial, password]]
      .filter(([s, pw]) => s.length > 0 && pw.length > 0)
    setSecrets(newSecrets)
    DecipherDebug(newSecrets)
    const newSerials = [...serials].filter(([p12, sn]) => sn != serial)
    DecipherDebug(newSerials)
    setSerials(newSerials)
    if (newSerials[0]) {
      setSerial(newSerials[0][1])
    } else {
      setSerial('')
    }
    setPassword('')
  }

  const handleRun = async () => {
    setIsRunning(true)
    const url = `${apiExternal}:3000/decipher`
    const body = { caseId, secrets }
    const decoder = new TextDecoder()
    try {
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      const reader = res.body.getReader()
      let progress = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        try {
          progress = Number(decoder.decode(value)?.match(/\d+%/)?.join()?.slice(0,-1))
        } catch (error) {
          console.log(error)
        }
        if (progress) setResult(progress)
        // console.log(progress)
      }
      setIsRunning(false)
    } catch (err) {
      // DecipherDebug(err)
      console.log(err)
      alert('Ohs Noes! Check the console for error msg')
      setIsRunning(false)
    }
  }

  const listKeys = (serials: SerialsType) => {
    return (
      <select id='selectSerial' className='form-control' value={serial} onChange={({target: {value}}) => setSerial(value)} disabled={serial === ''}>
        <option value='' disabled>Choose p12 filename key was extracted from</option>
        {serials.map(([p12, s]) => <option value={s} key={s}>{p12}</option>)}
      </select>
    )
  }

  return(
    <div className='container'>
      <Head>
        <title>Decipher</title>
      </Head>
      <main>
        <Menu currentPg='Decipher' caseId={caseId} />
        <h1>Decipher Email</h1>
        <h2>Set the PST Path</h2>
        <p>These are the pst files contianing encrypted email</p>
        <SetPath caseId={caseId} path={pstPath} pathName='pstPath' labelTxt='Input PST path' />
        <h2>Set the Plain Text Path</h2>
        <p>This is the output path for deciphered emails</p>
        <SetPath caseId={caseId} path={ptPath} pathName='ptPath' labelTxt='Output PT path' />
        <h2>Set the Exceptions Path</h2>
        <p>Anything that fails to be deciphered will go here. Email that was already PT will simply be copied to PT.</p>
        <SetPath caseId={caseId} path={exceptionsPath} pathName='exceptionsPath' labelTxt='Exceptions Path' />
        <h2>Enter Passwords</h2>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='selectSerial'>Select a Key and Enter it's Password</label>
            {listKeys(serials)}
          </div>
          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input id='password' type='password' className='form-control' value={password} onChange={({target: {value}}) => setPassword(value)} disabled={!serial} />
          </div>
          <button type='submit' className='btn btn-secondary' disabled={serial === ''}>Set Password</button>
        </form>
        <h2>Launch Script</h2>
        <button className='btn btn-primary' disabled={isRunning} onClick={() => handleRun()}>
          { isRunning ?
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M18.822 4.708c-.446-.417-.928-.794-1.443-1.125l.898-1.796c.733.452 1.416.976 2.034 1.57l-1.489 1.351zm-2.327-3.83c-.799-.323-1.642-.556-2.516-.702l-.117 2.004c.599.113 1.176.283 1.732.499l.901-1.801zm5.135 3.983l-1.489 1.352c.349.49.652 1.012.909 1.561l1.895-.678c-.357-.796-.801-1.542-1.315-2.235zm.083 4.8c.181.752.287 1.532.287 2.339 0 5.514-4.486 10-10 10s-10-4.486-10-10c0-1.914.551-3.697 1.489-5.217l2.173 2.173 1.353-7.014-7.015 1.35 2.037 2.038c-1.282 1.907-2.037 4.198-2.037 6.67 0 6.627 5.373 12 12 12s12-5.373 12-12c0-1.043-.147-2.05-.397-3.016l-1.89.677zm-12.112-9.406l.398 1.964c.607-.125 1.23-.202 1.871-.211l.117-2.008c-.818.001-1.614.097-2.386.255zm-2.601 14.78c.366.222 1.05.433 1.858.433 1.588 0 2.56-.809 2.56-1.906 0-.828-.606-1.396-1.356-1.53v-.019c.77-.26 1.146-.79 1.146-1.454-.001-.856-.742-1.559-2.07-1.559-.818 0-1.56.231-1.935.472l.298 1.059c.25-.154.789-.375 1.3-.375.625 0 .924.279.924.655 0 .529-.616.722-1.107.722h-.578v1.049h.597c.645 0 1.261.279 1.261.905 0 .462-.385.828-1.146.828-.597 0-1.193-.241-1.453-.385l-.299 1.105zm7.671-6.035c-1.616 0-2.377 1.424-2.377 3.244.01 1.771.722 3.224 2.339 3.224 1.588 0 2.367-1.338 2.367-3.263 0-1.713-.663-3.205-2.329-3.205zm-.009 5.361c-.559 0-.905-.683-.905-2.117 0-1.463.366-2.137.896-2.137.587 0 .885.731.885 2.117-.001 1.425-.309 2.137-.876 2.137z"/>
          </svg> :
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M3 22v-20l18 10-18 10z"/>
          </svg>
          }
          { isRunning? '    running...' : '    Run' }
        </button>
        <h2>Results</h2>
        <ProgressBar  now={result} />
        { result === 100 && <Alert variant='success'>DONE!</Alert>}
      </main>
    </div>
  )
}