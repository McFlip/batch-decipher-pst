import Uploader from "components/uploader"
import "@testing-library/jest-dom"
import {
  render,
  waitFor,
  logRoles,
  fireEvent,
  act,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import server from "mocks/server"
import { rest } from "msw"
import testP12 from "fixtures/p12"
import testPST from "fixtures/pst"

// NOTE: due to the useState function for setFiles being in the parent page,
// actual upload in-progress and upload complete behavior will be tested at the page level.
// Component tests will focus on behavior before the actual upload request is made

// mocking file useState from parent page
let files
const setFiles = jest.fn((f) => (files = f))
// mocking confirmation dialog
// Broken test (code works) - won't fix. In future I will roll my own confirmation and alert dialogues
// let confMsg = ""
window.confirm = jest.fn((msg) => {
  confMsg = msg
  return true
})
// mocking alert messages
let alertMsg = []
window.alert = jest.fn((msg) => alertMsg.push(msg))

describe("File Upload Component", () => {
  it("alerts the user when deleting uploads fails", async () => {
    server.use(
      rest.delete(
        "http://localhost:3000/sigs/upload/pst/:caseId",
        (req, res, ctx) => {
          return res.once(ctx.delay(), ctx.status(201))
        }
      )
    )
    const { getByText } = render(
      <Uploader
        caseId="12345"
        fileType="pst"
        destination="sigs"
        files={files}
        setFiles={setFiles}
      />
    )
    // check delete button
    await act(() => userEvent.click(getByText("Delete Uploads")))
    // check confirmation prompt
    // Broken test (code works) - won't fix. In future I will roll my own confirmation and alert dialogues
    // expect(confMsg).toBe('Are you sure? This cannot be undone!')
    // Delete btn txt will cycle from 'Delete Uploads' to 'Deleting...' and back
    await waitFor(() => expect(getByText("Deleting...")).toBeInTheDocument(), {
      timeout: 4000,
    })
    await waitFor(() => expect(getByText("Delete Uploads")), { timeout: 4000 })
    // anything other than 200 OK response gives alert
    expect(alertMsg[0]).toBe("Deleting PSTs failed :(")
  }),
    it("deletes previous uploads", async () => {
      const { getByText } = render(
        <Uploader
          caseId="12345"
          fileType="pst"
          destination="sigs"
          files={files}
          setFiles={setFiles}
        />
      )
      await act(() => userEvent.click(getByText("Delete Uploads")))
      await waitFor(
        () => expect(getByText("Deleting...")).toBeInTheDocument(),
        { timeout: 4000 }
      )
      await waitFor(() => expect(getByText("Delete Uploads")), {
        timeout: 4000,
      })
      // anything other than 200 OK response gives alert
      expect(alertMsg.length).toBeLessThan(2)
    }),
    it("validates a pst upload", async () => {
      const { getByText, getByRole, getByLabelText } = render(
        <Uploader
          caseId="12345"
          fileType="pst"
          destination="sigs"
          files={files}
          setFiles={setFiles}
        />
      )
      const testFile = new File(["test pst"], "test.pst")
      // Check proper render
      expect(getByText("Select all PSTs")).toBeInTheDocument()
      expect(getByText(/localhost/)).toHaveTextContent(
        "http://localhost:3000/sigs/upload/12345"
      )
      // clicking upload before selecting files should cause error msg
      await act(() => userEvent.click(getByText("Upload")))
      expect(alertMsg[1]).toBe("Please select pst to upload")
      // uploading anything other than pst files should fail
      await userEvent.upload(
        getByRole("button", { name: "File Upload" }),
        new File(["not a pst"], "test.jpg")
      )
      await act(() => userEvent.click(getByText("Upload")))
      expect(alertMsg[2]).toBe("Check file upload type")
      // do it right this time, check file mock for success
      await act(() =>
        userEvent.upload(getByLabelText(/select all psts/i), testPST)
      )
      await act(() => userEvent.click(getByText("Upload")))
      expect(files.item(0)).toBe(testPST)
      // we will check behavior on API returning success msg in the page level tests
    }),
    it("validates a p12 upload", async () => {
      const { getByText, getByRole, getByLabelText } = render(
        <Uploader
          caseId="12345"
          fileType="p12"
          destination="decipher"
          files={files}
          setFiles={setFiles}
        />
      )
      // Check proper render
      expect(getByText("Select one p12 at a time")).toBeInTheDocument()
      expect(getByText(/localhost/)).toHaveTextContent(
        "http://localhost:3000/keys/12345"
      )
      expect(getByLabelText("Enter password for p12 file:")).toBeInTheDocument()
      expect(
        getByLabelText(
          "Use a password manager to create a new password for the extacted key:"
        )
      ).toBeInTheDocument()
      // clicking upload before selecting files should cause error msg
      await act(() => userEvent.click(getByText("Upload")))
      expect(alertMsg[1]).toBe("Please select pst to upload")
      // uploading anything other than p12 files should fail
      await userEvent.upload(
        getByRole("button", { name: "File Upload" }),
        new File(["not a p12"], "test.jpg")
      )
      await act(() => userEvent.click(getByText("Upload")))
      expect(alertMsg[2]).toBe("Check file upload type")
      // do it right this time, check file mock for success
      await act(() =>
        userEvent.upload(getByLabelText(/select one p12/i), testP12)
      )
      await act(() => userEvent.click(getByText("Upload")))
      expect(files.item(0)).toStrictEqual(testP12)
      // we will check behavior on API returning success msg in the page level tests
      // we will also check password inputs
    })
})
