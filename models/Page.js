const mongoose = require('mongoose')

const Schema = mongoose.Schema

const pageSchema = new Schema({
  title: {
    type: String,
    require: true
  },
  handle: {
    type: String,
    require: true
  },
  content: String
})

module.exports = mongoose.model('Page', pageSchema)
