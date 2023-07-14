import Keys from "components/keysPg"
import { GetServerSideProps } from "next"
import debug from "debug"
import { apiInternal } from "constants/"
import { getServerSession } from "next-auth/next"
import authOptions from "pages/api/auth/[...nextauth]"
import jwt from "jsonwebtoken"
import type { User } from "next-auth"

const KeysDebug = debug("keys")
debug.enable("keys")

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
    const fetchSerials = await fetch(urlKeys, {
      method: "GET",
      mode: "cors",
      cache: "default",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
    })
    const serials: [string] = fetchSerials.ok ? await fetchSerials.json() : [""]
    return {
      props: { serialsProp: serials, caseId },
    }
  } catch (err) {
    KeysDebug(err)
    return { props: { serialsProp: [""], caseId } }
  }
}

export default ({
  serialsProp,
  caseId,
}: {
  serialsProp: string[]
  caseId: string
}) => (
  <>
    <Keys serialsProp={serialsProp} caseId={caseId} />
  </>
)
