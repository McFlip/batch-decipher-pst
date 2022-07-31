import ListCases from 'components/listcases'
import '@testing-library/jest-dom'
import { render, within } from '@testing-library/react'
import testCases from 'fixtures/cases'

describe('List Cases Component', () => {
	it('lists cases from props', () => {
		const { getByText, getAllByRole, getAllByText, debug } = render(<ListCases cases={testCases}/>)
		// table header
		expect(getByText('Forensicator')).toBeInTheDocument()
		expect(getByText('Case Name')).toBeInTheDocument()
		expect(getByText('Date Created')).toBeInTheDocument()
		// inspect rows
		// Each row should have a select case button
		const selButtons = getAllByText('Select Case')
		expect(selButtons.length).toBe(2)
		// next/link has been mocked - child will get hreff attribute
		expect(selButtons[0].getAttribute('href')).toBe('/1/editcase')
		expect(selButtons[1].getAttribute('href')).toBe('/2/editcase')
		// check table content
		const rows = getAllByRole('row')
		expect(within(rows[1]).getByText('first')).toBeInTheDocument()
		expect(within(rows[1]).getByText('Sherlock Holmes')).toBeInTheDocument()
		expect(within(rows[1]).getByText('1/1/1970')).toBeInTheDocument()
		expect(within(rows[2]).getByText('second')).toBeInTheDocument()
		expect(within(rows[2]).getByText('Batman')).toBeInTheDocument()
		expect(within(rows[2]).getByText('2/2/2022')).toBeInTheDocument()
		// debug(rows)
	})
})