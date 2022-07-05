// Testing the Home Page
import Home from 'pages/index'
import { render, fireEvent , within, waitForElementToBeRemoved , waitFor, logRoles } from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from '@testing-library/react'

let alertMsg = ''
window.alert = jest.fn(msg => alertMsg = msg)


describe('Home Page', () => {
	it('renders a menu without links', () => {
		const { getByText } = render(<Home />)

		const homeLink = getByText('Home')
		const homeLinkAnchor = within(homeLink).queryByRole('link')
		expect(homeLinkAnchor).toBeNull()
	})
	it('finds the 1st test case by forensicator', async () => {
		const { getByText, getByRole, findByText, debug, queryByText } = render(<Home />)

		act(() => fireEvent.change(getByRole('textbox'), { target: { value: 'Sherlock' }}))
		act(() => fireEvent.click(getByText('Search')))
		await findByText(/Holms/)
		// logRoles(getByRole('table'))
		expect(queryByText(/Batman/)).toBeNull()
	})
	it('finds the 2nd test case by name', async () => {
		const { getByText, getByRole, findByText, queryByText } = render(<Home />)

		act(() => fireEvent.change(getByRole('combobox'), { target: { value: 'name'}}))
		act(() => fireEvent.change(getByRole('textbox'), { target: { value: '2' }}))
		act(() => fireEvent.click(getByText('Search')))
		await findByText(/Batman/)
		expect(queryByText(/Holms/)).toBeNull()
	})
	it('lists all the cases', async () => {
		const { getByText, findByText } = render(<Home />)
		act(() => fireEvent.click(getByText('Search')))
		await findByText(/Holms/)
	})
	it('FAILS to find non-existent case', async () => {
		const { getByText, getByRole, findByText, debug, queryByText } = render(<Home />)

		// Get case 1 so that we can check for it's disapearance
		act(() => fireEvent.change(getByRole('textbox'), { target: { value: 'Sherlock' }}))
		act(() => fireEvent.click(getByText('Search')))
		await findByText(/Holms/)
		// Search for Pickle Rick which should return nothing and make the previous result disapear
		act(() => fireEvent.change(getByRole('textbox'), { target: { value: 'Pickle Rick' }}))
		act(() => fireEvent.click(getByText('Search')))
		await waitForElementToBeRemoved(queryByText(/Holms/))
		expect(alertMsg).toBe('no cases found')
		window.alert.mockClear()
	})
})