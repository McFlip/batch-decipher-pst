import Custodians from "pages/[caseId]/custodians"
import { render, waitFor, act } from "../../utils"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/router"

// mocking router
let mockRouter = []
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}))
const push = jest.fn((rte) => mockRouter.push(rte))
useRouter.mockImplementation(() => ({ push }))

const testCustodians = "Pooh\nPiglet\nTigger"

describe("Custodians Page", () => {
  it("renders the current list of custodians", () => {
    const { getByText } = render(
      <Custodians custodians={testCustodians} caseId="1" />
    )
    expect(getByText(/pooh/i)).toBeInTheDocument()
    expect(getByText(/piglet/i)).toBeInTheDocument()
    expect(getByText(/tigger/i)).toBeInTheDocument()
  })
  it("updates the custodians", async () => {
    const { getByRole } = render(
      <Custodians custodians={testCustodians} caseId="1" />
    )
    await userEvent.clear(getByRole("textbox"))
    await userEvent.type(
      getByRole("textbox"),
      "Ragnar@vikings.com\nBjorn@vikings.com\nFloki@vikings.com"
    )
    await act(() => userEvent.click(getByRole("button", { name: "Next" })))
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
  })
  it("FAILS to update with a malformed email", async () => {
    const { getByRole } = render(
      <Custodians custodians={testCustodians} caseId="1" />
    )
    await userEvent.clear(getByRole("textbox"))
    await userEvent.type(
      getByRole("textbox"),
      "Ragnar\nBjorn@vikings.com\nFloki@vikings.com"
    )
    await act(() => userEvent.click(getByRole("button", { name: "Next" })))
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
  })
})
