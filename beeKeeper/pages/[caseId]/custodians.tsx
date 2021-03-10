import Head from 'next/head'
import Link from 'next/link'

export default function Custodians() {
  return (
    <div className='container'>
      <Head>
        <title>Custodians</title>
      </Head>
      <main>
        <h1>Enter Custodians one per line</h1>
        <p>Each line is a REGEX that will be used to filter the results</p>
        <p><em>PRO TIP:</em> I strongly recommend you use the EDIPI number</p>
      </main>
    </div>
  )
}