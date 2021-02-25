// TODO: Delete this if I end up not using test context
interface Context extends Mocha.Context {
  apiURL: Express.Application | string
}
export default Context