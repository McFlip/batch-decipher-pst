import '@testing-library/jest-dom/extend-expect'
import { cloneElement } from 'react'

jest.mock(
  'next/link',
  () =>
    ({ children, ...rest }) =>
    cloneElement(children, { ...rest }),
);