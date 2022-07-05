import ClipBtn from '../components/clipbtn'
import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'
import { act } from '@testing-library/react'

// store clipboard contents
let clipboard = ''
// mock navigator.clipboard.writeText
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: (txt) => clipboard = txt,
  },
})

describe('Copy to Clipboard', () => {
	it('copies a str from the prop txtToCopy to the clipboard', () => {
		const { getByRole } = render(<ClipBtn txtToCopy="Swear to me!" />)
		act(() => fireEvent.click(getByRole('button')))
		expect(clipboard).toBe('Swear to me!')
	})
})