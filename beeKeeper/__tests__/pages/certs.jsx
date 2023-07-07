import Certs from "components/certsPg"
import { render, waitFor, getByLabelText } from "../../utils"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import testCert from "fixtures/cert"

describe("Certs Page", () => {
  it("fetches certs for current custodians", async () => {
    const testCustodians = "ragnar@vikings.com"
    const { getByRole, getByText } = render(
      <Certs caseId="1" custodians={testCustodians} />
    )
    await userEvent.click(getByRole("button", { name: "Batch Search" }))
    await waitFor(
      () =>
        expect(
          getByText(/12C3905B55296E401270C0CEB18B5BA660DB9A1F/)
        ).toBeInTheDocument(),
      { timeout: 4000 }
    )
  }),
    it("fetches certs by single email", async () => {
      const testCustodian = "ragnar@vikings.com"
      const { getByRole, getByText, findByText } = render(<Certs caseId="1" />)
      await userEvent.type(getByRole("textbox"), testCustodian)
      await userEvent.click(getByRole("button", { name: "Search" }))
      // await findByText("Searching...")
      await waitFor(
        () =>
          expect(
            getByText(/12C3905B55296E401270C0CEB18B5BA660DB9A1F/)
          ).toBeInTheDocument(),
        { timeout: 4000 }
      )
    })
  it("alerts 404 not found for email not in archive", async () => {
    const testCustodian = "UhtredSonOfUhtred@lastkingdom.com"
    const { getByRole, getByText, findByText } = render(<Certs caseId="1" />)
    await userEvent.type(getByRole("textbox"), testCustodian)
    await userEvent.click(getByRole("button", { name: "Search" }))
    await waitFor(
      () =>
        expect(
          getByText(
            /Error searching for UhtredSonOfUhtred@lastkingdom.com: Not Found/
          )
        ).toBeInTheDocument(),
      {
        timeout: 4000,
      }
    )
  }),
    it("warns when user forgets to enter email in searchbar", async () => {
      const { getByRole, getByText } = render(<Certs caseId="1" />)
      await userEvent.click(getByRole("button", { name: "Search" }))
      await waitFor(
        () => expect(getByText(/Unauthorized/)).toBeInTheDocument(),
        {
          timeout: 4000,
        }
      )
    }),
    it("warns when searching with a malformed email address", async () => {
      const { getByRole, getByText } = render(<Certs caseId="1" />)
      await userEvent.type(getByRole("textbox"), "fubar")
      await userEvent.click(getByRole("button", { name: "Search" }))
      await waitFor(
        () => expect(getByText(/fubar: Not Found/)).toBeInTheDocument(),
        { timeout: 4000 }
      )
    })
})
