import Menu from '../components/menu'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

describe('Menu Component', () => {
	it('renders nav links except for the current page', () => {
		const { getByText, debug } = render(<Menu currentPg='Custodians' caseId='12345' />)
		const custodianNavItem = getByText('Custodians')
		expect(custodianNavItem.getAttribute('href')).toBe(null)
		expect(custodianNavItem.getAttribute('class')).toBe('breadcrumb-item  active')
		expect(getByText('Case Details').getAttribute('href')).toBe('/12345/editcase')
	})
})