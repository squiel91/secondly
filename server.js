const express = require('express')
const fs = require('fs')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const bodyParser = require('body-parser')
const csrf = require('csurf')
const connectFlash = require('connect-flash')

const mongoose = require('mongoose')
// const helmet = require('helmet')
const compression = require('compression')
// const morgan = require('morgan')

const rootPath = require('./utils/root-path')
const env = require('./utils/env')

const storeApiRoutes = require('./routes/api-store-routes')
const adminApiRoutes = require('./routes/api-admin-routes')
const accessApiRoutes = require('./routes/api-access-routes')

const accessRoutes = require('./routes/access-routes')
const adminRoutes = require('./routes/admin-routes')
const storeRoutes = require('./routes/store-routes')
const galleryRoutes = require('./routes/gallery-routes')

const server = express()

const conUri = 'mongodb://localhost:27017/secondly'
const store = new MongoDBStore({
  uri: conUri,
  collection: 'sessions'
})

// Catch errors
store.on('error', function (error) {
  console.log(error)
})

server.use(
  require('express-session')({
    secret: 'j4gU4R',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    },
    store: store,
    // Boilerplate options, see:
    // * https://www.npmjs.com/package/express-session#resave
    // * https://www.npmjs.com/package/express-session#saveuninitialized
    resave: true,
    saveUninitialized: true
  })
)

server.set('template engine', 'ejs')
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())

if (!env.isDev) {
  server.use(csrf()) // To protect against CSRF attacks
}
server.use(connectFlash())
// server.use(helmet())
server.use(compression())

// const accessLogStream = fs.createWriteStream(rootPath('access.log'), {flags: 'a'})
// server.use(morgan('combined', { stream: accessLogStream }))

server.post('/cardaccio', (req, res, next) => {
  res.json({ reply: 'This is a message from the server' })
})

server.use('/api',
  adminApiRoutes,
  accessApiRoutes,
  storeApiRoutes,
)

server.use(accessRoutes)
server.use(storeRoutes)
server.use('/admin', adminRoutes)
server.use(galleryRoutes)

server.use(express.static(rootPath('public')))

// TODO: add a /resources path so I add it at the beginning and save power
server.use(express.static(rootPath('public')))

server.use((req, res, next) => {
  res.render('404.ejs')
})

// server.use((error, req, res, next) => {
//   res.render('500.ejs', { error })
// })

global.PREFERENCES = JSON.parse(
  fs.readFileSync(rootPath('data', 'preferences.json'))
)

mongoose.connect(conUri)
  .then(() => {
    server.listen(env.port, () => {
      console.log(`-- server listening at ${env.port}.`)
    })
  })
  .catch((err) => {
    console.log('ERROR: could not stablish connection with the database.', err)
  })
