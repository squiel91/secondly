const mongoose = require('mongoose')

const Schema = mongoose.Schema

const registerSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    min: 5
  },
  admin: {
    type: {
      owner: Boolean
    },
    default: null
  }
})

module.exports = mongoose.model('Register', registerSchema)
