import Menu from 'components/menu'
import SetPath from 'components/setpath'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {GetServerSideProps} from 'next'
import { useState } from 'react'
import debug from 'debug'

const CertsDebug = debug('keys')
debug.enable('keys')

export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: { fu: 'bar' }}
}

export default function Keys () {
  const router = useRouter()
  const {caseId}: {caseId?: string} = router.query
//   const [pstPath, setPstPath] = useState(props.pstPath)
  const [isRunning, setIsRunning] = useState(false)
    return(
      <div className='container'>
        <Head>
          <title>Extract Keys</title>
        </Head>
        <main>
          <Menu currentPg='Extract Keys' caseId={caseId} />
          <h1>Extract Keys From 'p12' Container</h1>
          <h2>Set the p12 path</h2>
          <p>Set the path before running to ensure propper permissions</p>
          <SetPath caseId={caseId} pathName='p12Path' path='' labelTxt='p12 Path:'/>
        </main>
      </div>
    )
}