import { render, screen, within } from '@testing-library/react'
import Home from '../pages/index'
import '@testing-library/jest-dom'

describe('Home', () => {
	it('renders a menu without links', () => {
		const { getByText } = render(<Home />)

		const homeLink = getByText('Home')
		const homeLinkAnchor = within(homeLink).queryByRole('link')
		expect(homeLinkAnchor).toBeNull()
	})
})