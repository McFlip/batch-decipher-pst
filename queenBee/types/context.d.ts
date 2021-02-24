interface Context extends Mocha.Context {
  apiURL: Express.Application | string
}
export default Context