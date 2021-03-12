import Head from 'next/head'
import Link from 'next/link'
import Menu from 'components/menu'

export default function Home() {
  return (
    <div className='container'>
      <Head>
        <title>Create or Select Case</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Menu currentPg='Home' />
        <h1>A: Create a new case</h1>
        <p>
          Click <Link href='/new-case'><a>here</a></Link> to create a new case.
        </p>
        <h1>B: Select a case</h1>
        <p>
          Search for cases by forensicator or case name.
          Searching with a blank name will list all cases.
          You can filter by active or inactive.
        </p>
      </main>
    </div>
  )
}