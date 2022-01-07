import Menu from 'components/menu'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {GetServerSideProps} from 'next'
import { useState } from 'react'
import debug from 'debug'
import { apiExternal, apiInternal } from '../../constants'
import Uploader from 'components/uploader'

const KeysDebug = debug('keys')
debug.enable('keys')

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {caseId} = context.params
  const urlKeys = `${apiInternal}:3000/keys/${caseId}`
  try {
    const fetchSerials = await fetch(urlKeys, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      headers: {'Content-Type': 'application/json'}
    })
    const serials: [string] = fetchSerials.ok ? await fetchSerials.json() : ['']
    return {
      props: { serialsProp: serials }
    }
  } catch (err) {
    KeysDebug(err)
    return { props: { serialsProp: [''] }}
  }
}

export default function Keys ({serialsProp}: { serialsProp: string[] }) {
  const router = useRouter()
  const {caseId}: {caseId?: string} = router.query
  const [serials, setSerials] = useState(serialsProp)
  const [files, setFiles] = useState<FileList>(null)

  const listSerials = (serials: string[]) => {
    KeysDebug(serials)
    return(
      <ul>
        {serials.map((serial) => {
          return (<li key={serial}> {serial} </li>)
        })}
      </ul>
    )
  }

  return(
    <div className='container'>
      <Head>
        <title>Extract Keys</title>
      </Head>
      <main>
        <Menu currentPg='Extract Keys' caseId={caseId} />
        <h1>Extract Keys From 'p12' Container</h1>
        <h2>Upload p12 file(s)</h2>
        <Uploader caseId={caseId} fileType='p12' destination='decipher' files={files} setFiles={setFiles} setSerials={setSerials} />
        <h2>Key Serial #s</h2>
        {listSerials(serials)}
      </main>
    </div>
  )
}