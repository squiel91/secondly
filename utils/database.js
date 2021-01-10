const { Console } = require('console')

const mongoClient = require('mongodb').MongoClient

let _db

exports.connect = callback => {
  mongoClient.connect('mongodb+srv://node:T7S5Khn4JHOzpLnV@omlab.l5mcm.mongodb.net/shop?retryWrites=true&w=majority')
    .then(client => {
      console.log('MongoDB Connected!')
      _db = client.db()
      callback()
    })
    .catch(error => {
      console.log(error)
    })
}

exports.getDb = () => {
  if (_db) {
    return _db
  } else {
    console.log('No database found.')
  }
} 
 