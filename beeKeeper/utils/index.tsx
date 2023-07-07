import React, { FC, ReactElement } from "react"
import { render, RenderOptions } from "@testing-library/react"
import { SessionProvider } from "next-auth/react"

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from "@testing-library/react"
export { customRender as render }

