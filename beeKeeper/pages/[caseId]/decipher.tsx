import { GetServerSideProps } from "next"
import debug from "debug"
import authOptions from "pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import axios from "axios"
import jwt from "jsonwebtoken"
import type { User } from "next-auth"
import { apiInternal } from "constants/"
import Decipher from "components/decipherPg"

const DecipherDebug = debug("decipher")
debug.enable("decipher")

interface propsType {
  caseId: string
  serialsProp?: string[]
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { caseId } = context.params
  const urlKeys = `${apiInternal}:3000/keys/${caseId}`
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
    const { data: serials } = await axios.get(urlKeys, config)
    return {
      props: { serialsProp: serials, caseId },
    }
  } catch (err) {
    DecipherDebug(err)
    return { props: { serialsProp: null, caseId } }
  }
}

export default ({ serialsProp, caseId }: propsType) => (
  <>
    <Decipher serialsProp={serialsProp} caseId={caseId} />
  </>
)
