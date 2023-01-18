import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.css'
import type Isession from 'types/session'
import { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router'

function App({
  Component,
  pageProps }: AppProps<{
    session: Isession
  }>) {
  return (
    <SessionProvider session={pageProps.session}>
      <Auth>
        <Component {...pageProps} />
      </Auth>
    </SessionProvider>
  )
}

// redirect to login pg w/ consent to monitor & signIn button
// only auth in production
function Auth({ children }) {
  const rtr = useRouter()
  // const { status } = useSession({ required: process.env.NODE_ENV === 'production' && rtr.pathname !== '/api/auth/login/request' })
  const { status } = useSession({ required: rtr.pathname !== '/api/auth/login/request' })

  if (status === "loading") {
    return <div className='container'>Authenticating. Stand by...</div>
  }

  return children
}

export default App
