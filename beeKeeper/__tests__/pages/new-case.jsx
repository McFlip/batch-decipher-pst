import NewCase from 'pages/new-case'
import { render, fireEvent , within, waitForElementToBeRemoved , waitFor, logRoles, getByRole } from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from "next/router"

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

describe('Create new case pg', () => {
	it('renders a menu without links', () => {
		const { getByText } = render(<NewCase />)
		const homeLink = getByText('Home')
		const homeLinkAnchor = within(homeLink).queryByRole('link')
		expect(homeLinkAnchor).toBeNull()
	}),
	it('puts a default case name and forensicator in the form', () => {
		const { getByLabelText } = render(<NewCase />)
		expect(getByLabelText('Forensicator:').value).toBe('Player1')
		expect(getByLabelText('Case Name:').value).toBe('Case1')
	}),
	it('FAILS to validate with missing Forensicator', async () => {
		const { getByLabelText, getByRole } = render(<NewCase />)
		await userEvent.clear(getByLabelText('Forensicator:'))
		await userEvent.click(getByRole('button', { name: 'Create' }))
		expect(alertMsg[0]).toBe('Missing Forensicator')
		expect(push).toHaveBeenCalledTimes(0)
	}),
	it('FAILS to validate with missing Case Name', async () => {
		const { getByLabelText, getByRole } = render(<NewCase />)
		await userEvent.clear(getByLabelText('Case Name:'))
		await userEvent.click(getByRole('button', { name: 'Create' }))
		expect(alertMsg[1]).toBe('Missing Case Name')
		expect(push).toHaveBeenCalledTimes(0)
	}),
	it('creates the case and routes user to the custodian pg', async () => {
		const { getByRole } = render(<NewCase />)
		act(() => fireEvent.click(getByRole('button', { name: 'Create' })))
		await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
		expect(push).toHaveBeenCalledWith('1234/custodians')
	})
})