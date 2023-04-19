import type { User } from 'next-auth'

export default interface Iuser extends User {
	last_name ?: string,
	first_name ?: string,
	username ?: string,
	role?: string[]
}