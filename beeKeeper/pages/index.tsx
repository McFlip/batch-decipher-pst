import Head from 'next/head'
import Link from 'next/link'
import {useState, useEffect} from 'react'
import debug from 'debug'
import Menu from 'components/menu'
import SearchBar from 'components/searchbar'
import ListCases from 'components/listcases'

const HomeDebug = debug('home')
debug.enable('home')

export default function Home() {
  const [cases, setCases] = useState()
  const handlSearch = async (searchCategory, searchTerm) => {
    HomeDebug(`Search by ${searchCategory} for ${searchTerm}`)
    const url = `http://localhost:3000/cases/search?${searchCategory}=${encodeURI(searchTerm)}`
    try {
      const res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        // cache: 'no-cache',
        headers: {'Content-Type': 'application/json'}
      })
      const fetchedCases = await res.json()
      HomeDebug(fetchedCases)
      setCases(fetchedCases)
    } catch (err) {
      HomeDebug(err)
    }
  }
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
        <SearchBar onSearch={handlSearch} />
        <ListCases cases={cases} />
      </main>
    </div>
  )
}