const mongoose = require('mongoose')

const Schema = mongoose.Schema

const pageSchema = new Schema({
  title: String,
  handle: {
    type: String,
    require: true
  },
  content: String
})

module.exports = mongoose.model('Page', pageSchema)