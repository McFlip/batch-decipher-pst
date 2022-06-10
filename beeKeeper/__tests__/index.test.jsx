// Testing the Home Page
import Home from '../pages/index'
import { render, fireEvent , within, waitForElementToBeRemoved , waitFor, logRoles } from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import {rest} from 'msw'
import {setupServer} from 'msw/node'

let alertMsg = ''
window.alert = jest.fn(msg => alertMsg = msg)

const testCase1 = {
	_id: '1234',
	name: 'test case 1',
	forensicator: 'Sherlock Holms',
	dateCreated: '1/1/1970',
	custodians: 'Alice\nBob'
}
const testCase2 = {
	_id: '4321',
	name: 'test case 2',
	forensicator: 'Batman',
	dateCreated: '2/20/2020',
	custodians: 'yaboi'
}

const server = setupServer(
  rest.get('http://localhost:3000/cases/search', (req, res, ctx) => {
		const forensicator = req.url.searchParams.get('forensicator')
		const name = req.url.searchParams.get('name')
		// console.log(forensicator)
		// console.log(name)
		if(forensicator) {
			switch (forensicator) {
				case 'Sherlock':
					return res(ctx.json([testCase1]))
				case 'Batman':
					return res(ctx.json([testCase2]))
				default:
					return res(ctx.json([]))
			}
		} else if(name) {
			switch(name) {
				case '1':
					return res(ctx.json([testCase1]))
				case '2':
					return res(ctx.json([testCase2]))
				default:
					return res(ctx.json([]))
			}
		} else {
			return res(ctx.json([ testCase1, testCase2 ]))
		}
  }),
)

beforeAll(() => server.listen({
	onUnhandledRequest: 'error'
}
))
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => server.close())

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