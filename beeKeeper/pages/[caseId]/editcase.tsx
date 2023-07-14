import EditCase from "components/editcasePg"
import { GetServerSideProps } from "next"
import debug from "debug"
import CaseType from "types/case"
import axios from "axios"
import { getServerSession } from "next-auth/next"
import type { User } from "next-auth"
import authOptions from "pages/api/auth/[...nextauth]"
import jwt from "jsonwebtoken"
import { apiInternal } from "constants/"

const EditDebug = debug("editCase")
debug.enable("editCase")

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
    EditDebug(`API Key: ${user.email}`)
    const config = {
      headers: { Authorization: `Bearer ${apiKey}` },
    }
    const { data }: { data: CaseType } = await axios.get(url, config)
    return {
      props: { myCase: data }, // will be passed to the page component as props
    }
  } catch (err) {
    EditDebug(err)
  }
}

export default ({ myCase }: { myCase: CaseType }) => {
  ;<>
    <EditCase myCase={myCase} />
  </>
}
