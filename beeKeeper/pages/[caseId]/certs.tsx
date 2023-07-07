import { GetServerSideProps } from "next"
import debug from "debug"
import { getServerSession } from "next-auth/next"
import { apiInternal } from "constants/"
import authOptions from "pages/api/auth/[...nextauth]"
import caseType from "types/case"
import jwt from "jsonwebtoken"
import { User } from "next-auth"
import CertsPg from "components/certsPg"

const CertsDebug = debug("certs")
debug.enable("certs")

interface propsType {
  caseId: string
  custodians?: string
}

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

export default function Certs({ caseId, custodians }: propsType) {
  return (
    <>
      <CertsPg caseId={caseId} custodians={custodians} />
    </>
  )
}
