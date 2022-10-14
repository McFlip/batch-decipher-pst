import Link from "next/link"
import styles from 'styles/menu.module.scss'
import { useSession, signIn, signOut } from 'next-auth/react' // for login\out button
import type Isession from 'types/session'

type currentPgType = 'Home' | 'Case Details' | 'Custodians' | 'Get Cert Info' | 'Extract Keys' | 'Decipher' 
export default function Menu({currentPg, caseId}: {currentPg: currentPgType, caseId?: string}) {
  const { data: session }: { data: Isession} = useSession()

  const listPages = (currentPg: string) => {
    const pages = [
      ['Home', '/'],
      ['Case Details', `/${caseId}/editcase`],
      ['Custodians', `/${caseId}/custodians`],
      ['Get Cert Info', `/${caseId}/certs`],
      ['Extract Keys', `/${caseId}/keys`],
      ['Decipher', `/${caseId}/decipher`]
    ]
    return pages.map(([p, href], index) => {
      const isActive = p === currentPg ? ' active' : ''
      const liClassName = `${styles['breadcrumb-item']} ${isActive}`
      return(
        <li className={liClassName} key={index}>
          {!isActive && caseId ? <Link href={href}><a>{p}</a></Link> : p}
        </li>
      )
    })
  }

  // TODO: Change from local signOut to Single Logoff w/ SAML
  return(
    <nav className='navbar  navbar-dark'>
      <ol className='breadcrumb'>
        {listPages(currentPg)}
      </ol>
      {session?.user.email}
      {session ? <button className="btn btn-warning" onClick={() => signOut()}>Log off</button> : ''}
    </nav>
  )
}