const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const User = require('../models/User')
const userTemplate = require('../models/templates/user')

const env = require('../utils/env')

const mailer = require('../utils/mailer')
const stdRes = require('../utils/standard-response')

// email templates
const welcomeEmail = require('../email-templates/welcome-email')
const reqPassResetEmail = require('../email-templates/request-password-reset-email')

const login = (req, user, remember) => {
  req.session.userId = user.id
  // if(!req.body.remember) req.session.cookie.maxAge = 0
}

exports.postRegister = async (req, res, next) => {
  try {
    const email = req.body.email
    const firstName = req.body.firstName

    const duplicatedUser = await User.findOne({ email })
    if (duplicatedUser) return stdRes._400(res, 'email', 'There is already an user with that email')

    const passHash = await bcrypt.hash(req.body.password, 10)

    let user = new User({
      email,
      firstName,
      lastName: req.body.lastName,
      passHash
    })

    user = await user.save()

    // time to log the user in
    login(req, user, req.body.remember)

    // only send welcome email when in stagging or production
    if (!env.isDev) mailer(user.email, welcomeEmail.subject(firstName), welcomeEmail.body())

    res.json({
      success: true,
      user: userTemplate(user)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postLogin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) return stdRes._400(res, 'email', 'No account associated with this email')
    const passIsAMatch = await bcrypt.compare(req.body.password, user.passHash)
    if (!passIsAMatch) return stdRes._400(res, 'password', 'The password is incorrect')

    // time to log the user in
    login(req, user, req.body.remember)

    res.json({
      success: true,
      user: userTemplate(user)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postLogout = async (req, res, next) => {
  try {
    req.session.destroy()
    res.json({ success: true })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postRequestPasswordReset = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) return stdRes._400(res, 'email', 'There is no user with that email')
    const randomBuffer = crypto.randomBytes(32) // Can be done async, but this method is rearely accessed
    const token = randomBuffer.toString('hex')
    user.passResetToken = token
    user.passResetExp = Date.now() + 3600000 // 1 hour expiration

    await user.save()
    mailer(user.email, reqPassResetEmail.subject(), reqPassResetEmail.body(token))
    return res.json({ success: true })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postPasswordReset = async (req, res, next) => {
  try {
    const user = await User.findOne({
      passResetToken: req.body.passResetToken,
      passResetExp: { $gt: Date.now() }
    })
    if (!user) return res.status(400).json({ error: true, message: 'Invalid or expired token' })
    const passHash = await bcrypt.hash(req.body.password, 10)
    user.passHash = passHash
    user.passResetToken = undefined
    user.passResetExp = undefined
    await user.save()
    login(req, user, req.body.remember)
    return res.json({ success: true, user: userTemplate(user) })
  } catch (error) { stdRes._500(res, error.message) }
}
