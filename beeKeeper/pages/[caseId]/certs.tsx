import Menu from "components/menu"
import Head from "next/head"
import { GetServerSideProps } from "next"
import { useState } from "react"
import debug from "debug"
import Button from "react-bootstrap/Button"
import { apiExternal, apiInternal } from "constants/"
import ClipBtn from "components/clipbtn"
import { getServerSession } from "next-auth/next"
import { getSession } from "next-auth/react"
import Isession from "types/session"
import authOptions from "pages/api/auth/[...nextauth]"
import caseType from "types/case"
import jwt from "jsonwebtoken"
import { User } from "next-auth"

const CertsDebug = debug("certs")
debug.enable("certs")

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { caseId } = context.params
  const caseUrl = `${apiInternal}:3000/cases/${caseId}`
  let custodians = ""
  try {
    const { user }: { user: User } = await getServerSession(
      context.req,
      context.res,
      authOptions
    )
    const apiKey = jwt.sign(
      { email: user.email, iat: Date.now() },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "24h" }
    )
    const resCustodians = await fetch(caseUrl, {
      method: "GET",
      mode: "cors",
      cache: "default",
      headers: { authorization: `Bearer ${apiKey}` },
    })
    if (resCustodians.ok) {
      const custodiansJSON = (await resCustodians.json()) as caseType
      custodians = custodiansJSON.custodians
    } else {
      CertsDebug(resCustodians.statusText)
    }
    CertsDebug(custodians)
  } catch (err) {
    CertsDebug(err)
  }
  return {
    props: { caseId, custodians },
  }
}

interface propsType {
  caseId: string
  custodians?: string
}

interface ICert {
  sha1: string
  serial: string
  email: string
  subject: string
  userPrincipleName: string
  issuer: string
  notBefore: string
  notAfter: string
}

export default function Certs(props: propsType) {
  const { caseId, custodians } = props
  const [certs, setCerts] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [custodianEmail, setCustodianEmail] = useState("")

  const prettyPrintCert = (certs: ICert[]) => {
    return certs
      .map((cert) => {
        const {
          subject,
          email,
          userPrincipleName,
          serial,
          issuer,
          notBefore,
          notAfter,
        } = cert
        const commonName = subject.split(",")[0].split("=")[1].split(".")
        const name = commonName.slice(0, -1)
        return `Name:           ${name[0]}, ${name[1]} ${
          name.length > 2 ? name[2] : ""
        }\nEmail:          ${email}\nEDIPI:          ${commonName.slice(
          -1
        )}\nPrinciple Name: ${userPrincipleName}\nSerial:         ${serial}\nIssuer:         ${issuer.replaceAll(
          "\n",
          ""
        )}\nCA:             ${
          issuer.split(",")[0].split("=")[1]
        }\nNot Before:     ${notBefore}\nNot After:      ${notAfter}\n`
      })
      .join("\n")
  }

  const findCert = async (custodianEmail: string) => {
    const url = `${apiExternal}:3000/certs/email/${custodianEmail}`
    const { apiKey } = (await getSession()) as Isession
    const resCerts = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: { authorization: `Bearer ${apiKey}` },
    })
    if (resCerts.ok) {
      const resJSON = await resCerts.json()
      return prettyPrintCert(resJSON)
    } else {
      return `Error searching for ${custodianEmail}: ${resCerts.statusText}`
    }
  }

  const handleSingleSearch = async (custodianEmail: string) => {
    setIsRunning(true)
    setCerts(await findCert(custodianEmail))
    setIsRunning(false)
  }

  const handleBatchSearch = async (custodiansList: string) => {
    setIsRunning(true)
    const results = custodiansList
      .split("\n")
      .map((custodian) => findCert(custodian))
    const allCerts = await Promise.all(results)
    setCerts(allCerts.join("\n"))
    setIsRunning(false)
  }

  return (
    <div className="container">
      <Head>
        <title>Get Cert Info</title>
      </Head>
      <main>
        <Menu currentPg="Get Cert Info" caseId={caseId} />
        <h1>Get Cert Info</h1>
        <p>
          Search the cert archive to get the needed cert info such as serial #,
          dates, and issuer info
        </p>
        <hr />
        <h2>Search all custodians</h2>
        <p>
          Click the Batch Search button to search for all listed custodians at
          once
        </p>
        <Button
          className="btn btn-primary"
          disabled={isRunning}
          onClick={() => handleBatchSearch(custodians)}
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
            " "
          )}
          {isRunning ? "    Searching..." : "    Batch Search"}
        </Button>
        <hr />
        <h2>Search individual custodian</h2>
        <p>Input 1 email</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSingleSearch(custodianEmail)
          }}
          className="form-inline"
        >
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={custodianEmail}
              onChange={(e) => setCustodianEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
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
              " "
            )}
            {isRunning ? "    Searching..." : "    Search"}
          </button>
        </form>
        <hr />
        <h2>Results</h2>
        <p>A printout of each parsed cert will appear below.</p>
        <ClipBtn txtToCopy={certs} /> <hr />
        <pre>
          <code role="certs">{certs}</code>
        </pre>
      </main>
    </div>
  )
}
