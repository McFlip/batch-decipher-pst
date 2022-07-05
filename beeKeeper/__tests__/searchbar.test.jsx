import SearchBar from '../components/searchbar'
import '@testing-library/jest-dom'
import { render, fireEvent } from '@testing-library/react'
import { act } from '@testing-library/react'

let searchCategory, searchTerm
const mockSearch = (category, term) => {
	searchCategory = category
	searchTerm = term
}

describe('Search Bar to find cases', () => {
	it('searches by forensicator', () => {
		const { getByRole, getByText } = render(<SearchBar onSearch={mockSearch} />)
		act(() => fireEvent.change(getByRole('textbox'), { target: { value: 'Sherlock' }}))
		act(() => fireEvent.click(getByText('Search')))
		expect(searchCategory).toBe('forensicator')
		expect(searchTerm).toBe('Sherlock')
	})
	it('searches by case name', () => {
		const { getByRole, getByText } = render(<SearchBar onSearch={mockSearch} />)
		act(() => fireEvent.change(getByRole('combobox'), { target: { value: 'name'}}))
		act(() => fireEvent.change(getByRole('textbox'), { target: { value: 'test case' }}))
		act(() => fireEvent.click(getByText('Search')))
		expect(searchCategory).toBe('name')
		expect(searchTerm).toBe('test case')
	})
})