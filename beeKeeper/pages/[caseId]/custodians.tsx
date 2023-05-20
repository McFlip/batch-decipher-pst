import Head from "next/head"
import { useRouter } from "next/router"
import { GetServerSideProps } from "next"
import { FormEvent, useState } from "react"
import Menu from "components/menu"
import debug from "debug"
import { apiExternal, apiInternal } from "constants/"
import axios from "axios"
import { getServerSession } from "next-auth/next"
import { getSession } from "next-auth/react"
import Isession from "types/session"
import authOptions from "pages/api/auth/[...nextauth]"
import jwt from "jsonwebtoken"
import type { User } from "next-auth"

const custodiansDebug = debug("custodians")
debug.enable("custodians")

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { caseId } = context.params
  const url = `${apiInternal}:3000/cases/${caseId}`
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
    const config = {
      headers: { Authorization: `Bearer ${apiKey}` },
    }
    const {
      data: { custodians },
    } = await axios.get(url, config)
    return {
      props: { custodians: custodians || "", caseId },
    }
  } catch (err) {
    custodiansDebug(err)
    return { props: { custodians: "", caseId } }
  }
}

export default function Custodians({
  custodians,
  caseId,
}: {
  custodians: string
  caseId: string
}) {
  const [myCustodians, setMyCustodians] = useState(custodians)
  const router = useRouter()
  custodiansDebug(caseId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const url = `${apiExternal}:3000/cases/${caseId}`
    try {
      const { apiKey } = (await getSession()) as Isession
      const config = {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
      const res = await axios.patch(url, { custodians: myCustodians }, config)
      if (res.status == 200) {
        router.push(`/${caseId}/certs`)
      }
    } catch (err) {
      custodiansDebug(err)
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Custodians</title>
      </Head>
      <main>
        <Menu currentPg="Custodians" caseId={caseId} />
        <h1>Enter Custodian emails one per line</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="myCustodians">Custodians</label>
            <textarea
              id="myCustodians"
              className="form-control"
              rows={12}
              value={myCustodians}
              onChange={(e) => setMyCustodians(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Next
          </button>
        </form>
      </main>
    </div>
  )
}
