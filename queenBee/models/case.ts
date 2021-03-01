import mongoose from 'mongoose'
const Schema = mongoose.Schema
import {pathValidator} from '../util/pathvalidator'
// const ObjectId = mongoose.Schema.Types.ObjectId

const caseSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Case name is required']
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  forensicator: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  pstPath: {
    type: String,
    validate: {
      validator: pathValidator,
      message: 'Cannot access path'
    }
  },
  p12Path: {
    type: String,
    validate: {
      validator: pathValidator,
      message: 'Cannot access path'
    }
  },
  ptPath: {
    type: String,
    validate: {
      validator: pathValidator,
      message: 'Cannot access path'
    }
  }
})

export const Case = mongoose.model('Case', caseSchema)