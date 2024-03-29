import { DefaultBodyType, rest } from "msw"
import { setupServer } from "msw/node"
// import CaseType from 'types/case'
import testCases from "fixtures/cases"
// import cert from "fixtures/cert"

const cert = {
  sha1: "abcdef1234567890",
  serial: "12C3905B55296E401270C0CEB18B5BA660DB9A1F",
  email: "ragnar@vikings.com",
  subject: "commonName = LAST.FIRST.MIDDLE.12345678",
  userPrincipleName: "testUPN",
  issuer: "testIssuer",
  notBefore: "Jan 1 2020",
  notAfter: "Jan 1 2023",
}
const testCase1 = {
  _id: "1234",
  name: "test case 1",
  forensicator: "Sherlock Holmes",
  dateCreated: "1/1/1970",
  custodians: "Alice\nBob",
}
const testCase2 = {
  _id: "4321",
  name: "test case 2",
  forensicator: "Batman",
  dateCreated: "2/20/2020",
  custodians: "yaboi",
}
interface DelPostRes {
  caseId: string
}
interface DelPostParams {
  caseId: string
}
interface CasePatchReq {
  name?: string
  forensicator?: string
  custodians?: string
}
interface CasePatchRes {
  _id: string
  dateCreated: string
  name: string
  forensicator: string
  custodians: string
}
interface CasePatchParams {
  caseId: string
}

const server = setupServer(
  rest.get("http://localhost/api/auth/session", (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          email: "tester@test.org",
        },
      })
    )
  }),
  rest.get("http://localhost:3000/cases/search", (req, res, ctx) => {
    const forensicator = req.url.searchParams.get("forensicator")
    const name = req.url.searchParams.get("name")
    // console.log(forensicator)
    // console.log(name)
    if (forensicator) {
      switch (forensicator) {
        case "Sherlock":
          return res(ctx.json([testCase1]))
        case "Batman":
          return res(ctx.json([testCase2]))
        default:
          return res(ctx.json([]))
      }
    } else if (name) {
      switch (name) {
        case "1":
          return res(ctx.json([testCase1]))
        case "2":
          return res(ctx.json([testCase2]))
        default:
          return res(ctx.json([]))
      }
    } else {
      return res(ctx.json([testCase1, testCase2]))
    }
  }),
  rest.patch<CasePatchReq, CasePatchParams, CasePatchRes>(
    "http://localhost:3000/cases/:caseId",
    (req, res, ctx) => {
      const caseId = req.params.caseId
      const { name, forensicator, custodians } = req.body
      const oldData = testCases[caseId]
      const newData = {
        _id: oldData._id,
        dateCreated: oldData.dateCreated,
        name: name || oldData.name,
        forensicator: forensicator || oldData.forensicator,
        custodians: custodians || oldData.custodians,
      }
      return res(ctx.json(newData))
    }
  ),
  rest.delete<DefaultBodyType, DelPostParams, DelPostRes>(
    "http://localhost:3000/sigs/upload/pst/:caseId",
    (req, res, ctx) => {
      // expecting to recieve caseId 12345
      const caseId = req.params.caseId
      if (caseId != "12345")
        return res(ctx.delay(), ctx.status(400), ctx.json({ caseId }))
      return res(
        ctx.delay(), // need a delay to test Delete button behavior
        ctx.json({ caseId })
      )
    }
  ),
  rest.post("http://localhost:3000/sigs/upload/:caseId", (req, res, ctx) => {
    return res(
      ctx.delay(), // need a delay to test Upload button behavior
      ctx.text("PST(s) uploaded")
    )
  }),
  rest.post("http://localhost:3000/cases", (req, res, ctx) => {
    const caseId = "1234"
    return res(ctx.json({ caseId }))
  }),
  rest.post("http://localhost:3000/sigs", (req, res, ctx) => {
    return res(ctx.body("test terminal output"))
  }),
  // rest.get("http://localhost:3000/sigs/:caseId", (req, res, ctx) => {
  //   const caseId = req.params.caseId
  //   console.log(caseId)
  //   return res(ctx.text(cert))
  // }),
  rest.post("http://localhost:3000/keys/:caseId", (req, res, ctx) => {
    return res(ctx.json(["1a2b3c"]))
  }),
  rest.post("http://localhost:3000/decipher", (req, res, ctx) => {
    return res(ctx.text("stream output from job container"))
  }),
  rest.get("http://localhost:3000/certs/email/:email", (req, res, ctx) => {
    const email = req.params.email
    if (!email) return res(ctx.status(401))
    if (email === "ragnar@vikings.com")
      return res(ctx.delay(), ctx.json([cert]))
    return res(ctx.status(404), ctx.json({ err: "certs not found" }))
  }),
  rest.get("http://localhost:3000/certs/email/", (req, res, ctx) => {
    return res(ctx.status(401))
  })
)

export default server
