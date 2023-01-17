import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import debug from 'debug'
import Menu from 'components/menu'
import SearchBar from 'components/searchbar'
import ListCases from 'components/listcases'
import { apiExternal } from 'constants/'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import Isession from 'types/session'

const HomeDebug = debug('home')
debug.enable('home')

export default function Home() {
  const [cases, setCases] = useState()
  const handlSearch = async (searchCategory: 'forensicator' | 'name', searchTerm: string) => {
    HomeDebug(`Search by ${searchCategory} for ${searchTerm}`)
    const url = `${apiExternal}:3000/cases/search?${searchCategory}=${encodeURI(searchTerm)}`
    try {
      const { apiKey } = await getSession() as Isession
      HomeDebug(`API Key: ${apiKey}`)
      const config = {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      }
      const { data } = await axios.get(url, config)
      if (data.length === 0) alert('no cases found')
      HomeDebug(data)
      setCases(data)
    } catch (err) {
      HomeDebug(`failed to fetch ${url}`)
      // HomeDebug(err)
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
        <p>Start by either creating a new case or selecting an existing case to work on</p>
        <h1>A: Create a new case</h1>
        <p>
          Click <Link href='/new-case'><a>here</a></Link> to create a new case.
        </p>
        <h1>B: Select a case</h1>
        <p>
          Search for cases by forensicator or case name.
          Searching with a blank name will list all cases.
        </p>
        <SearchBar onSearch={handlSearch} />
        <ListCases cases={cases} />
        <hr />
        <h2>How to use this app</h2>
        <p>
          This app uses a wizard format. The menu at the top indicates your step in the pipleine going from left to right.
          The workflow on each page goes from top to bottom.
        </p>
        <p>
          There are 2 phases. The first is gathering cert info to make a request for keys. The second is extracting the keys you receive and deciphering email.
          Create a new case and advance to "Get Cert Info". After receiving keys, return to the case and go to "Extract Keys".
        </p>
      </main>
    </div>
  )
}