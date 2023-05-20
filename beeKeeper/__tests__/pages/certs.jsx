import Certs from "pages/[caseId]/certs"
import { render, waitFor, getByLabelText } from "../../utils"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import testCert from "fixtures/cert"

// mocking alert messages
let alertMsg = []
window.alert = jest.fn((msg) => alertMsg.push(msg))

describe("Certs Page", () => {
  it("displays certs from props", () => {
    const { getByText } = render(<Certs caseId="1" certTxt={testCert} />)
    expect(
      getByText(/serial=12C3905B55296E401270C0CEB18B5BA660DB9A1F/)
    ).toBeInTheDocument()
  }),
    it("fetches certs for current custodians", async () => {
      const testCustodians = "ragnar@vikings.com"
      const { getByRole, getByText } = render(
        <Certs caseId="1" custodians={testCustodians} />
      )
      await userEvent.click(getByRole("button", { name: "Batch Search" }))
      await waitFor(
        () =>
          expect(
            getByText(/serial=12C3905B55296E401270C0CEB18B5BA660DB9A1F/)
          ).toBeInTheDocument(),
        { timeout: 4000 }
      )
    }),
    it("fetches certs by single email", async () => {
      const testCustodian = "ragnar@vikings.com"
      const { getByRole, getByText, findByText } = render(<Certs caseId="1" />)
      await userEvent.type(getByLabelText("Email"), testCustodian)
      await userEvent.click(getByRole("button", { name: "Search" }))
      await findByText("Searching...")
      await waitFor(
        () =>
          expect(
            getByText(/serial=12C3905B55296E401270C0CEB18B5BA660DB9A1F/)
          ).toBeInTheDocument(),
        { timeout: 4000 }
      )
    })
  it("alerts 404 not found for email not in archive", async () => {
    const testCustodian = "UhtredSonOfUhtred@lastkingdom.com"
    const { getByRole, getByText, findByText } = render(<Certs caseId="1" />)
    await userEvent.type(getByLabelText("Email"), testCustodian)
    await userEvent.click(getByRole("button", { name: "Search" }))
    expect(alertMsg).to.eq(["Email not found"])
  }),
    it("warns when user forgets to enter email in searchbar", async () => {
      alertMsg = []
      const { getByRole } = render(<Certs caseId="1" />)
      await userEvent.click(getByRole("button", { name: "Search" }))
      expect(alertMsg).to.eq("Please enter a valid email")
    }),
    it("warns when searching with a malformed email address", async () => {
      alertMsg = []
      const { getByRole } = render(<Certs caseId="1" />)
      await userEvent.type(getByLabelText("Email"), "fubar")
      await userEvent.click(getByRole("button", { name: "Search" }))
      expect(alertMsg).to.eq("Please enter a valid email")
    })
})
