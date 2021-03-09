// TODO: Delete this if I end up not using test context
import type { MongoClient } from 'mongodb'
interface myContext extends Mocha.Context {
  // apiURL: Express.Application | string | undefined,
  client: MongoClient
}
export default myContext