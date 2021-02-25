// TODO: Delete this if I end up not using test context
interface myContext extends Mocha.Context {
  apiURL: Express.Application | string | undefined
}
export default myContext