import Decipher from "components/decipherPg"
import "@testing-library/jest-dom"
import { render } from "../../utils"
import userEvent from "@testing-library/user-event"

// mocking alert messages
let alertMsg = []
window.alert = jest.fn((msg) => alertMsg.push(msg))

describe("decipher pg", () => {
  it("warns when no keys are loaded in the case", () => {
    const { getByText } = render(<Decipher caseId="1" serialsProp={[]} />)
    expect(getByText(/WARNING/)).toBeInTheDocument()
    // check that run button is disabled
    expect(getByText(/Run/)).toBeDisabled()
  }),
    it("runs a decipher job", async () => {
      const { findByText, queryByText, getByText, getByLabelText } = render(
        <Decipher caseId="1" serialsProp={["1a2b3c"]} />
      )
      // check that the warning is not present
      expect(queryByText(/WARNING/)).toBeNull()
      // check validation of password input
      await userEvent.click(getByText(/Run/))
      expect(alertMsg[0]).toBe("missing password")
      // do it right
      // can't currently test because can't polyfill streamreader in jsdom env
      // await userEvent.type(getByLabelText('Password'), 'key-password')
      // await userEvent.click(getByText(/Run/))
      // await findByText('Running...')
    })
})
