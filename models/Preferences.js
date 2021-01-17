const mongoose = require('mongoose')

const Schema = mongoose.Schema

const preferencesSchema = new Schema({
  preferences: {},
}, { timestamps: { createdAt: 'created' } })

module.exports = mongoose.model('Preferences', preferencesSchema)