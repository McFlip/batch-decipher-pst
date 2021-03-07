import { Document, Date } from 'mongoose'

interface CaseType extends Document {
    name: string,
    dateCreated: Date,
    status: string,
    pstPath: string,
    p12Path: string,
    ptPath: string,
    exceptionsPath: string,
    custodians: string
}

export default CaseType