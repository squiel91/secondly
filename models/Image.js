const mongoose = require('mongoose')

const Schema = mongoose.Schema

const imageSchema = new Schema({
  name: {
    type: String,
  },
  src: {
    type: String,
    required: true
  },
  alt: String
})

module.exports = mongoose.model('Image', imageSchema)
