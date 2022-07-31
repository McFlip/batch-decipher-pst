import '@testing-library/jest-dom/extend-expect'
import { cloneElement } from 'react'
import server from 'mocks/server'
import * as util from 'util'
import fetch from 'whatwg-fetch' // polyfill for fetch in jsdom env - doesn't support streams yet https://github.com/github/fetch/issues/1109
// axios does not support streaming yet either

// ref: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
// ref: https://github.com/jsdom/jsdom/issues/2524
Object.defineProperty(window, 'TextEncoder', {
  writable: true,
  value: util.TextEncoder
})
Object.defineProperty(window, 'TextDecoder', {
  writable: true,
  value: util.TextDecoder
})

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