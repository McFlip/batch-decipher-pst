import Custodians from "components/custodiansPg"
import { GetServerSideProps } from "next"
import debug from "debug"
import { apiExternal, apiInternal } from "constants/"
import axios from "axios"
import { getServerSession } from "next-auth/next"
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

export default ({
  custodians,
  caseId,
}: {
  custodians: string
  caseId: string
}) => (
  <>
    <Custodians custodians={custodians} caseId={caseId} />
  </>
)
