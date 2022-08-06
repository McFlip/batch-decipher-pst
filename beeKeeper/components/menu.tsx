import Link from "next/link"
import styles from 'styles/menu.module.scss'
import { useSession, signIn, signOut } from 'next-auth/react' // for login\out button

type currentPgType = 'Home' | 'Case Details' | 'Custodians' | 'Get Cert Info' | 'Extract Keys' | 'Decipher' 
export default function Menu({currentPg, caseId}: {currentPg: currentPgType, caseId?: string}) {
  // log in & out button not necessary with middleware - keeping just in case I want to add sign out later
  const { data: session } = useSession()
  // // const callbackUrl = process.env.NODE_ENV === 'development' ?
  // //   { callbackUrl: 'http://localhost:3001/' } :
  // //   {}
  // const callbackUrl = {}
  // const logInBtn = () => {
  //   if(session) {
  //     return(
  //       <span>
  //         Hello {session.user.email} <br />
  //         <button onClick={() => signOut(callbackUrl)}>Log off</button>
  //       </span>
  //     )
  //   }
  //     return(
  //       <span>
  //         <button onClick={() => signIn("credentials", callbackUrl)}>Log in</button>
  //       </span>
  //     )
  // }
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
      {/* {logInBtn()} */}
      {session?.user.email}
    </nav>
  )
}