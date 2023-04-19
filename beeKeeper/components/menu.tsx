import Link from "next/link"
import styles from 'styles/menu.module.scss'
import { signOut, useSession } from 'next-auth/react' // for login\out button
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

  const logoutBtn = (email: string) => {
    // Link to SAML single logout request
    const handleClick = (email: string) => {
      signOut({ callbackUrl: `/api/auth/logout/request?email=${encodeURIComponent(email)}`})
    }
    return(
      <button className="btn btn-warning" onClick={() => handleClick(email)}>Log off</button>
    )
  }

  return(
    <nav className='navbar  navbar-dark'>
      <ol className='breadcrumb'>
        {listPages(currentPg)}
      </ol>
      {session?.user.email}
      {session ? logoutBtn(session?.user.email) : ''}
    </nav>
  )
}