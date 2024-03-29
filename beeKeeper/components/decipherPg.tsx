import Menu from "components/menu"
import Uploader from "components/uploader"
import Head from "next/head"
import { useState } from "react"
import ProgressBar from "react-bootstrap/ProgressBar"
import Alert from "react-bootstrap/Alert"
import { apiExternal } from "constants/"
import { getSession } from "next-auth/react"
import Isession from "types/session"
// import debug from 'debug'

// const DecipherDebug = debug("decipher")
// debug.enable("decipher")

interface propsType {
  caseId: string
  serialsProp?: string[]
}

export default function Decipher({ serialsProp, caseId }: propsType) {
  const [password, setPassword] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState(0)
  const [files, setFiles] = useState<FileList>(null)
  const [processedPSTs, setProcessedPSTs] = useState<string[]>([])

  const handleRun = async () => {
    if (!password) return alert("missing password")
    setIsRunning(true)
    const url = `${apiExternal}:3000/decipher`
    const body = { caseId, password }
    const decoder = new TextDecoder()
    try {
      setResult(0)
      setProcessedPSTs([""])
      const { apiKey } = (await getSession()) as Isession
      const res = await fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })
      const reader = res.body.getReader()
      let progress = 0
      let currPST: string = null
      let pstArr: string[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        try {
          progress = Number(
            decoder.decode(value)?.match(/\d+%/)?.join()?.slice(0, -1)
          )
          currPST = decoder
            .decode(value)
            ?.match(/^\*\*\*Processing .*/)
            ?.join()
          if (currPST?.length > 0) {
            pstArr.push(currPST)
            setProcessedPSTs(pstArr)
          }
        } catch (error) {
          console.log(error)
        }
        if (progress) setResult(progress)
        // console.log(progress)
      }
      setIsRunning(false)
      setResult(100)
    } catch (err) {
      // DecipherDebug(err)
      console.log(err)
      alert("Ohs Noes! Check the console for error msg")
      setIsRunning(false)
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Decipher</title>
      </Head>
      <main>
        <Menu currentPg="Decipher" caseId={caseId} />
        <h1>Decipher Email</h1>
        {serialsProp.length < 1 ? (
          <div className="alert alert-danger">
            WARNING: no keys are loaded for this case!
          </div>
        ) : (
          ""
        )}
        <h2>Upload PSTs with encrypted email</h2>
        <Uploader
          caseId={caseId}
          fileType="pst"
          destination="decipher"
          files={files}
          setFiles={setFiles}
        />
        <hr />
        <h2>Enter Password</h2>
        <p>Use the password you generated when extracting keys</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={({ target: { value } }) => setPassword(value)}
            />
          </div>
        </form>
        <hr />
        <h2>Launch Script</h2>
        <button
          className="btn btn-primary"
          disabled={serialsProp.length < 1 || isRunning}
          onClick={() => handleRun()}
        >
          {isRunning ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M18.822 4.708c-.446-.417-.928-.794-1.443-1.125l.898-1.796c.733.452 1.416.976 2.034 1.57l-1.489 1.351zm-2.327-3.83c-.799-.323-1.642-.556-2.516-.702l-.117 2.004c.599.113 1.176.283 1.732.499l.901-1.801zm5.135 3.983l-1.489 1.352c.349.49.652 1.012.909 1.561l1.895-.678c-.357-.796-.801-1.542-1.315-2.235zm.083 4.8c.181.752.287 1.532.287 2.339 0 5.514-4.486 10-10 10s-10-4.486-10-10c0-1.914.551-3.697 1.489-5.217l2.173 2.173 1.353-7.014-7.015 1.35 2.037 2.038c-1.282 1.907-2.037 4.198-2.037 6.67 0 6.627 5.373 12 12 12s12-5.373 12-12c0-1.043-.147-2.05-.397-3.016l-1.89.677zm-12.112-9.406l.398 1.964c.607-.125 1.23-.202 1.871-.211l.117-2.008c-.818.001-1.614.097-2.386.255zm-2.601 14.78c.366.222 1.05.433 1.858.433 1.588 0 2.56-.809 2.56-1.906 0-.828-.606-1.396-1.356-1.53v-.019c.77-.26 1.146-.79 1.146-1.454-.001-.856-.742-1.559-2.07-1.559-.818 0-1.56.231-1.935.472l.298 1.059c.25-.154.789-.375 1.3-.375.625 0 .924.279.924.655 0 .529-.616.722-1.107.722h-.578v1.049h.597c.645 0 1.261.279 1.261.905 0 .462-.385.828-1.146.828-.597 0-1.193-.241-1.453-.385l-.299 1.105zm7.671-6.035c-1.616 0-2.377 1.424-2.377 3.244.01 1.771.722 3.224 2.339 3.224 1.588 0 2.367-1.338 2.367-3.263 0-1.713-.663-3.205-2.329-3.205zm-.009 5.361c-.559 0-.905-.683-.905-2.117 0-1.463.366-2.137.896-2.137.587 0 .885.731.885 2.117-.001 1.425-.309 2.137-.876 2.137z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M3 22v-20l18 10-18 10z" />
            </svg>
          )}
          {isRunning ? "    running..." : "    Run"}
        </button>
        <h2>Results</h2>
        <p>The output will be in the shared folder</p>
        <hr />
        <ol>
          {processedPSTs.map((pst, i) => (
            <li key={i}>{pst}</li>
          ))}
        </ol>
        <hr />
        <ProgressBar now={result} />
        {result === 100 && isRunning === false && (
          <Alert variant="success">DONE!</Alert>
        )}
      </main>
    </div>
  )
}
