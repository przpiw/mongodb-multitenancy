import mongoose from 'mongoose'

const employeeSchema = mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
  },
  companyName: {
    type: String,
  },
})
export default employeeSchema
