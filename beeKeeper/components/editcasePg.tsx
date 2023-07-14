import Menu from "components/menu"
import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { apiExternal } from "constants/"
import { getSession } from "next-auth/react"
import Isession from "types/session"
import debug from "debug"
import axios from "axios"
import CaseType from "types/case"

const EditDebug = debug("editCase")
debug.enable("editCase")

/**
 *
 * @param myCase the case to be edited
 * @todo validate custodian input as email addresses
 */
export default function EditCase({ myCase }: { myCase: CaseType }) {
  const router = useRouter()

  const [name, setName] = useState(myCase.name)
  const [forensicator, setForensicator] = useState(myCase.forensicator)
  const [custodians, setCustodians] = useState(myCase.custodians)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // validation - name & forensicator are required
    if (!name) return alert("Case Name is required")
    if (!forensicator) return alert("Forensicator is required")
    const values = [
      ["name", name, myCase.name],
      ["forensicator", forensicator, myCase.forensicator],
      ["custodians", custodians, myCase.custodians],
    ]
    let updates = {}
    values.filter((i) => i[1] != i[2]).forEach((i) => (updates[i[0]] = i[1]))
    EditDebug(updates)
    const url = `${apiExternal}:3000/cases/${myCase._id}`
    try {
      const { apiKey } = (await getSession()) as Isession
      const config = {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
      const res = await axios.patch(url, updates, config)
      const updatedCase = res.data
      EditDebug(updatedCase)
      if (updatedCase) {
        router.push(`/${myCase._id}/custodians`)
      }
    } catch (err) {
      EditDebug(err)
    }
  }

  const handleDelete = async (e: FormEvent, caseId: string) => {
    e.preventDefault()
    if (confirm("Are you sure? This cannot be undone!")) {
      const url = `${apiExternal}:3000/cases/${caseId}`
      try {
        const { apiKey } = (await getSession()) as Isession
        const res = await fetch(url, {
          method: "DELETE",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${apiKey}`,
          },
        })
        if (res.ok) {
          router.push("/")
        } else {
          alert("Failed to delete case")
        }
      } catch (err) {
        EditDebug(err)
      }
    }
  }

  return (
    <div className="container">
      <Menu caseId={myCase._id} currentPg="Case Details" />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Case Name:</label>
          <input
            id="name"
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="forensicator">Forensicator:</label>
          <input
            id="forensicator"
            type="text"
            className="form-control"
            value={forensicator}
            onChange={(e) => setForensicator(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="custodians">Custodians:</label>
          <textarea
            id="custodians"
            className="form-control"
            rows={12}
            value={custodians}
            onChange={(e) => setCustodians(e.target.value)}
          />
        </div>
        <button
          className="btn btn-danger"
          onClick={(e) => handleDelete(e, myCase._id)}
        >
          Delete
        </button>{" "}
        <button type="submit" className="btn btn-primary">
          Update
        </button>{" "}
        <Link href={`/${myCase._id}/custodians`}>
          <a>
            <button className="btn btn-success">Look's good, Continue</button>
          </a>
        </Link>
      </form>
    </div>
  )
}
