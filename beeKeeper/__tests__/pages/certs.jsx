import Certs from 'pages/[caseId]/certs'
import { render, fireEvent , within, waitForElementToBeRemoved , waitFor, logRoles, getByRole } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import testCert from 'fixtures/cert'
// import testCases from 'fixtures/cases'

// mocking alert messages
let alertMsg = []
window.alert = jest.fn(msg => alertMsg.push(msg))

describe('Certs Page', () => {
	it('displays certs from props', () => {
		const { getByText } = render(<Certs caseId='1' certTxt={testCert} />)
		expect(getByText(/serial=12C3905B55296E401270C0CEB18B5BA660DB9A1F/)).toBeInTheDocument()
	}),
	it('uploads & runs cert extraction', async () => {
		const { getByLabelText, getByRole, getByText } = render(<Certs caseId='1' />)
		const testFile = new File(['test pst'], 'test.pst')
		// upload file
		await userEvent.upload(getByLabelText(/select all psts/i), testFile )
		await userEvent.click(getByRole('button', { name: 'Upload' }))
		await waitFor(() => expect(alertMsg.length).toBe(1))
		expect(alertMsg[0]).toBe('PST(s) uploaded')
		// Run
		// Can't create stream reader in jsdom env
		// Will test in e2e test
		// await userEvent.click(getByRole('button', { name: 'Run'}))
		// await waitFor(() => expect(getByText(/serial=12C3905B55296E401270C0CEB18B5BA660DB9A1F/)).toBeInTheDocument(), {timeout: 4000})
	})
})