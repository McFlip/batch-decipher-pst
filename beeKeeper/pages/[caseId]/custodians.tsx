import Head from 'next/head'
import Link from 'next/link'
import {useRouter} from 'next/router'
import Menu from 'components/menu'
import debug from 'debug'

const custodiansDebug = debug('custodians')
debug.enable('custodians')

export default function Custodians() {
  const router = useRouter()
  const {caseId}: {caseId?: string} = router.query
  custodiansDebug(caseId)
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
      </main>
    </div>
  )
}