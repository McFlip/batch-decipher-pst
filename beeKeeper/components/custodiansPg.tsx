import Head from "next/head"
import { useRouter } from "next/router"
import { FormEvent, useState } from "react"
import Menu from "components/menu"
import { apiExternal, apiInternal } from "constants/"
import axios from "axios"
import { getSession } from "next-auth/react"
import Isession from "types/session"
import debug from "debug"

const custodiansDebug = debug("custodians")
debug.enable("custodians")

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
