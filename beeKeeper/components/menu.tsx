import Link from "next/link"
import styles from 'styles/menu.module.scss'

type currentPgType = 'Home' | 'Case Details' | 'Custodians' | 'Get Cert Info' | 'Extract Keys' | 'Decipher' 
export default function Menu({currentPg, caseId}: {currentPg: currentPgType, caseId?: string}) {
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
  return(
    <nav className='navbar  navbar-dark'>
      <ol className='breadcrumb'>
        {listPages(currentPg)}
      </ol>
    </nav>
  )
}