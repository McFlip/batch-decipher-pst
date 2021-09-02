import Menu from 'components/menu'
import SetPath from 'components/setpath'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {GetServerSideProps} from 'next'
import { useState } from 'react'
import debug from 'debug'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

const CertsDebug = debug('certs')
debug.enable('certs')
const apiInternal = process.env.API_INTERNAL || 'localhost'
const apiExternal = process.env.NEXT_PUBLIC_API_EXTERNAL || 'localhost'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {caseId} = context.params
  const urlCase = `${apiInternal}:3000/cases/${caseId}`
  const urlCerts = `${apiInternal}:3000/sigs/${caseId}`
  try {
    const resPst = fetch(urlCase, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      headers: {'Content-Type': 'application/json'}
    })
    const resCerts = fetch(urlCerts, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
    })
    const [pst, cert] = await Promise.all([resPst, resCerts])
    let {pstPath}: {pstPath: string} = await pst.json()
    if (!pstPath) pstPath = ''
    let certTxt = cert.ok? await cert.text() : ''
    CertsDebug(certTxt)
    if (!certTxt) certTxt = ''
    return {
      props: { pstPath, certTxt }
    }
  } catch (err) {
    CertsDebug(err)
  }
}

interface propsType {
  pstPath: string,
  certTxt?: string
}

export default function Certs (props: propsType) {
  const router = useRouter()
  const {caseId}: {caseId?: string} = router.query
  const [certs, setCerts] = useState(props?.certTxt || '')
  const [isRunning, setIsRunning] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const [terminalTxt, setTerminalTxt] = useState('')

  const handleRun = async (caseId: string) => {
    setIsRunning(true)
    const url = `${apiExternal}:3000/sigs`
    const urlCerts = `${url}/${caseId}`
    const body = { caseId }
    const decoder = new TextDecoder()

    try {
      // Run the container and send response stream to terminal modal
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      })
      const reader = res.body.getReader()
      let decoded = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        decoded = decoded + decoder.decode(value, {stream: true})
        setTerminalTxt(decoded)
      }
      decoded = decoded + decoder.decode()
      setTerminalTxt(decoded)
      setIsRunning(false)
      // Fetch the results
      const resCerts = await fetch(urlCerts, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      })
      if (resCerts.ok) setCerts(await resCerts.text())
    } catch (err) {
      CertsDebug(err)
      // console.log(err)
      alert('Ohs Noes! Check the console for error msg')
      setIsRunning(false)
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
        <SetPath path={props.pstPath} pathName='pstPath' caseId={caseId} labelTxt='PST Path:' />
        <h2>Launch Script</h2>
        <button className='btn btn-primary' disabled={isRunning} onClick={() => handleRun(caseId)}>
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
        <button className='btn btn-secondary' onClick={() => navigator.clipboard.writeText(certs)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M16 10c3.469 0 2 4 2 4s4-1.594 4 2v6h-10v-12h4zm.827-2h-6.827v16h14v-8.842c0-2.392-4.011-7.158-7.173-7.158zm-8.827 12h-6v-16h4l2.102 2h3.898l2-2h4v2.145c.656.143 1.327.391 2 .754v-4.899h-3c-1.229 0-2.18-1.084-3-2h-8c-.82.916-1.771 2-3 2h-3v20h8v-2zm2-18c.553 0 1 .448 1 1s-.447 1-1 1-1-.448-1-1 .447-1 1-1zm4 18h6v-1h-6v1zm0-2h6v-1h-6v1zm0-2h6v-1h-6v1z"/>
          </svg>
          Copy to clipboard
        </button>
        {' '}
        <Button variant='info' onClick={() => setShowTerminal(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M22 6v16h-20v-16h20zm2-6h-24v24h24v-24zm-11 11v1.649l3.229 1.351-3.229 1.347v1.653l5-2.201v-1.599l-5-2.2zm-7 2.201v1.599l5 2.2v-1.653l-3.229-1.347 3.229-1.351v-1.649l-5 2.201z"/>
        </svg>
        Show Terminal
        </Button>
        <pre><code>{certs}</code></pre>
        <Modal show={showTerminal} onHide={() => setShowTerminal(false)} size='lg' centered>
          <Modal.Header closeButton>
            Terminal Output
          </Modal.Header>
          <Modal.Body><pre><code>{terminalTxt}</code></pre></Modal.Body>
          <Modal.Footer>
            <Button variant='primary' onClick={() => setShowTerminal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  )
}