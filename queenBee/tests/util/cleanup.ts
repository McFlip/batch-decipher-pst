// cleans up the workspace folder after tests
// pass this to the "after()" func in test suites
import fs from 'fs'
import path from 'path'

const rtPath = '/app/workspace'
export const cleanup = async function() {
	const caseDirs = fs.readdirSync(rtPath)
	caseDirs.forEach((folder) => {
		fs.rmSync(path.join(rtPath, folder), { recursive: true, force: true })
	})}