import type { Session } from "next-auth"
import type { Iuser } from "types/user"

export default interface Isession extends Session {
	user?: Iuser
}