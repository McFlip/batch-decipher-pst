import type { Session } from "next-auth"
import type { Iuser } from "types/user"
import type { JWT } from 'next-auth/jwt'

export default interface Isession extends Session {
	user?: Iuser,
  apiKey?: string
}