import Uploader from '../components/uploader'
import '@testing-library/jest-dom'
import { render, waitFor, logRoles, fireEvent } from '@testing-library/react'
import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import server from '../mocks/server'
import {rest} from 'msw'

let files
const setFiles = jest.fn(f => files = f)
let confMsg = ''
window.confirm = jest.fn((msg) => {
	confMsg = msg
	return true
})
let alertMsg = []
window.alert = jest.fn(msg => alertMsg.push(msg))

describe('File Upload Component', () => {
	it('alerts the user when deleting uploads fails', async () => {
		server.use(
			rest.delete('http://localhost:3000/sigs/upload/pst/:caseId', (req, res, ctx) => {
				return res.once(
					ctx.delay(),
					ctx.status(201)
					)
			})
		)
		const { getByText, findByText, debug } = render(<Uploader caseId='12345' fileType='pst' destination='sigs' files={files} setFiles={setFiles} />)
		// check delete button
		await act(() => userEvent.click(getByText('Delete Uploads')))
		// check confirmation prompt
		expect(confMsg).toBe('Are you sure? This cannot be undone!')
		// Delete btn txt will cycle from 'Delete Uploads' to 'Deleting...' and back
		await waitFor(() => expect(getByText('Deleting...')).toBeInTheDocument(), { timeout: 4000})
		await waitFor(() => expect(getByText('Delete Uploads')), { timeout: 4000 })
		// anything other than 200 OK response gives alert
		expect(alertMsg[0]).toBe('Deleting PSTs failed :(')
	}),
	it('uploads a pst file', async () => {
		const { getByText, findByText, debug } = render(<Uploader caseId='12345' fileType='pst' destination='sigs' files={files} setFiles={setFiles} />)
		// Check proper render
		expect(getByText('Select all PSTs')).toBeInTheDocument()
		expect(getByText(/localhost/)).toHaveTextContent('http://localhost:3000/sigs/upload/12345')
		await act(() => userEvent.click(getByText('Delete Uploads')))
		await waitFor(() => expect(getByText('Deleting...')).toBeInTheDocument(), { timeout: 4000})
		await waitFor(() => expect(getByText('Delete Uploads')), { timeout: 4000 })
		// anything other than 200 OK response gives alert
		expect(alertMsg.length).toBeLessThan(2)
	})
})