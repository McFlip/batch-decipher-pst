import EditCase from "pages/[caseId]/editcase"
import { render, waitFor, act } from "../../utils"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/router"
import testCases from "fixtures/cases"

/**
 * @todo Jest is broken due to jose dep in next-auth in unstable_getServerSession
 */
// Due to Jest transformer issues, we mock next-auth's useSession hook directly:
const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: { name: "admin" },
}
jest.mock("next-auth/react", () => {
  const originalModule = jest.requireActual("next-auth/react")
  return {
    __esModule: true,
    ...originalModule,
    useSession: jest.fn(() => ({
      data: mockSession,
      status: "authenticated",
    })),
  }
})
// Reference: https://github.com/nextauthjs/next-auth/discussions/4185#discussioncomment-2397318
// We also need to mock the whole next-auth package, since it's used in
// our various pages via the `export { getServerSideProps }` function.
jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(),
  unstable_getServerSession: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve({
          expiresIn: undefined,
          loggedInAt: undefined,
          someProp: "someString",
        })
      })
  ),
}))
// Reference: https://github.com/nextauthjs/next-auth/issues/4866

// mocking alert messages
let alertMsg = []
window.alert = jest.fn((msg) => alertMsg.push(msg))
// mocking router
let mockRouter = []
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}))
const push = jest.fn((rte) => mockRouter.push(rte))
useRouter.mockImplementation(() => ({ push }))

describe("Edit Case Page", () => {
  const [testCase] = testCases
  it("populates the form with props", () => {
    const { getByRole } = render(<EditCase myCase={testCase} />)
    expect(getByRole("textbox", { name: "Case Name:" }).value).toBe("first")
    expect(getByRole("textbox", { name: "Forensicator:" }).value).toBe(
      "Sherlock Holmes"
    )
    expect(getByRole("textbox", { name: "Custodians:" }).value).toBe("")
  }),
    it("FAILS to update with no name", async () => {
      const { getByLabelText, getByRole } = render(
        <EditCase myCase={testCase} />
      )
      await act(() => {
        userEvent.clear(getByLabelText("Case Name:"))
      })
      await act(() => {
        userEvent.click(getByRole("button", { name: "Update" }))
      })
      expect(mockRouter.length).toBe(0)
    }),
    it("FAILS to update with no forensicator", async () => {
      const { getByLabelText, getByRole } = render(
        <EditCase myCase={testCase} />
      )
      await act(() => {
        userEvent.clear(getByLabelText("Forensicator:"))
      })
      await act(() => {
        userEvent.click(getByRole("button", { name: "Update" }))
      })
      expect(mockRouter.length).toBe(0)
    }),
    it("updates the custodian list", async () => {
      const { getByLabelText, getByRole } = render(
        <EditCase myCase={testCase} />
      )
      await act(() => {
        userEvent.type(getByLabelText("Custodians:"), "Pooh\nPiglet\nTigger")
      })
      await act(() => {
        userEvent.click(getByRole("button", { name: "Update" }))
      })
      await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
    })
})
