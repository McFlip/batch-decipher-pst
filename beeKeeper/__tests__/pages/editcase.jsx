import EditCase from "pages/[caseId]/editcase"
import { render, fireEvent , within, waitForElementToBeRemoved , waitFor, logRoles, getByRole, act } from '../../utils'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { useRouter } from "next/router"
import testCases from 'fixtures/cases'

// mocking alert messages
let alertMsg = []
window.alert = jest.fn(msg => alertMsg.push(msg))
// mocking router
let mockRouter = []
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}))
const push = jest.fn(rte => mockRouter.push(rte))
useRouter.mockImplementation(() => ({push}))

describe('Edit Case Page', () => {
  const [testCase] = testCases
  it('populates the form with props', ()=> {
    const { getByRole } = render(<EditCase myCase={testCase} />)
    expect(getByRole('textbox', { name: "Case Name:"}).value).toBe('first')
    expect(getByRole('textbox', { name: "Forensicator:"}).value).toBe('Sherlock Holmes')
    expect(getByRole('textbox', { name: "Custodians:"}).value).toBe('')
  }),
  it('FAILS to update with no name', async () => {
    const { getByLabelText, getByRole } = render(<EditCase myCase={testCase} />)
    await act(() => {userEvent.clear(getByLabelText("Case Name:"))})
    await act(() => {userEvent.click(getByRole('button', { name: 'Update' }))})
    expect(mockRouter.length).toBe(0)
  }),
  it('FAILS to update with no forensicator', async () => {
    const { getByLabelText, getByRole } = render(<EditCase myCase={testCase} />)
    await act(() => {userEvent.clear(getByLabelText('Forensicator:'))})
    await act(() => {userEvent.click(getByRole('button', { name: 'Update' }))})
    expect(mockRouter.length).toBe(0)
  }),
  it('updates the custodian list', async () => {
    const { getByLabelText, getByRole } = render(<EditCase myCase={testCase} />)
    await act(() => {userEvent.type(getByLabelText('Custodians:'), 'Pooh\nPiglet\nTigger')})
    await act(() => {userEvent.click(getByRole('button', { name: 'Update' }))})
		await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
  })
})