import Keys from "components/keysPg"
import "@testing-library/jest-dom"
import { render, waitFor, logRoles, fireEvent } from "../../utils"
import userEvent from "@testing-library/user-event"
import server from "mocks/server"
import { rest } from "msw"
import testFile from "fixtures/p12"

// mocking alert messages
let alertMsg = []
window.alert = jest.fn((msg) => alertMsg.push(msg))

describe("Keys Pg", () => {
  it("renders a serial # from props", () => {
    const { getByText, queryByText } = render(
      <Keys serialsProp={["1a2b3c"]} caseId="1" />
    )
    expect(getByText("1a2b3c")).toBeInTheDocument()
    // check that Delete PSTs section was not rendered
    expect(queryByText(/Delete/)).toBeNull()
  }),
    it("extracts a key from a p12", async () => {
      const { getByLabelText, getByRole, findByText } = render(
        <Keys serialsProp={[""]} caseId="1" />
      )
      await userEvent.upload(getByLabelText(/select one p12/i), testFile)
      // check missing key pw
      await userEvent.type(
        getByLabelText("Enter password for p12 file:"),
        "p12-password"
      )
      await userEvent.click(getByRole("button", { name: "Upload" }))
      expect(alertMsg[0]).toBe("Please create a password for the key")
      // check missing p12 pw
      await userEvent.clear(getByLabelText("Enter password for p12 file:"))
      await userEvent.type(
        getByLabelText(
          "Use a password manager to create a new password for the extacted key:"
        ),
        "key-password"
      )
      await userEvent.click(getByRole("button", { name: "Upload" }))
      expect(alertMsg[1]).toBe(
        "Please enter the password for the p12 container"
      )
      // do it right
      await userEvent.type(
        getByLabelText("Enter password for p12 file:"),
        "p12-password"
      )
      await userEvent.click(getByRole("button", { name: "Upload" }))
      await findByText("1a2b3c")
    })
})
