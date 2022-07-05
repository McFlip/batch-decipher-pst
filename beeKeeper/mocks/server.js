import {rest} from 'msw'
import {setupServer} from 'msw/node'

const testCase1 = {
	_id: '1234',
	name: 'test case 1',
	forensicator: 'Sherlock Holms',
	dateCreated: '1/1/1970',
	custodians: 'Alice\nBob'
}
const testCase2 = {
	_id: '4321',
	name: 'test case 2',
	forensicator: 'Batman',
	dateCreated: '2/20/2020',
	custodians: 'yaboi'
}

const server = setupServer(
  rest.get('http://localhost:3000/cases/search', (req, res, ctx) => {
		const forensicator = req.url.searchParams.get('forensicator')
		const name = req.url.searchParams.get('name')
		// console.log(forensicator)
		// console.log(name)
		if(forensicator) {
			switch (forensicator) {
				case 'Sherlock':
					return res(ctx.json([testCase1]))
				case 'Batman':
					return res(ctx.json([testCase2]))
				default:
					return res(ctx.json([]))
			}
		} else if(name) {
			switch(name) {
				case '1':
					return res(ctx.json([testCase1]))
				case '2':
					return res(ctx.json([testCase2]))
				default:
					return res(ctx.json([]))
			}
		} else {
			return res(ctx.json([ testCase1, testCase2 ]))
		}
  }),
	rest.delete('http://localhost:3000/sigs/upload/pst/:caseId', (req, res, ctx) => {
		const caseId = req.params
		return res(
			ctx.delay(), // need a delay to test Delete button behavior
			ctx.json({ caseId })
			)
	})
)

export default server