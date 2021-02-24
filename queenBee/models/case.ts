import mongoose from 'mongoose'
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

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
  }
})

export const Case = mongoose.model('Case', caseSchema)