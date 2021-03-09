import {accessSync, constants} from 'fs'

export const pathValidator = (myPath: string) => {
  try {
    accessSync(myPath, constants.R_OK | constants.W_OK)
    return true
  } catch (error) {
    return false
  }
}
