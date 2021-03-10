import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.css'
import { AppProps } from 'next/app'

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default App
