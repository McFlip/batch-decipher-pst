// cleans up the workspace folder after tests
// pass this to the "after()" func in test suites
import fs from 'fs'
import path from 'path'

const rtPaths = ['/app/workspace', '/srv/public']
export const cleanup = async function() {
	rtPaths.forEach(rtFolder => {
		fs.readdirSync(rtFolder).forEach((subFolder) => {
			fs.rmSync(path.join(rtFolder, subFolder), { recursive: true, force: true })
		})
	})
}