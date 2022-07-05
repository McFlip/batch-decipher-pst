import '@testing-library/jest-dom/extend-expect'
import { cloneElement } from 'react'
import server from 'mocks/server'

jest.mock(
  'next/link',
  () =>
    ({ children, ...rest }) =>
    cloneElement(children, { ...rest }),
)

beforeAll(() => server.listen({
	onUnhandledRequest: 'error'
}
))
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => server.close())