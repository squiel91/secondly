const validator = require('validator')

const stdRes = require('../../utils/standard-response')


exports.postRegister = (req, res, next) => {
  try{
    if(!req.body.email) return stdRes._400(res, 'email', 'Please enter email')
    req.body.email = req.body.email.trim().toLowerCase()
    if(!validator.isEmail(req.body.email)) return stdRes._400('email', 'Enter a valid email')

    if(!req.body.firstName) return stdRes._400(res, 'firstName', 'Please enter firstName')
    req.body.firstName = req.body.firstName.trim()

    if(!req.body.lastName) return stdRes._400(res, 'lastName', 'Please enter lastName')
    req.body.lastName = req.body.lastName.trim()
    
    const password = req.body.password 
    if(!password) return stdRes._400(res, 'password', 'Please enter a password')
    if(password.length < 6) return stdRes._400(res, 'password', 'The password needs to have 6 or more characters')

    next()

  } catch (error) { stdRes._500(res, error.message) }
}

exports.postLogin = (req, res, next) => {
  try{
    if (!req.body.email) return stdRes._400(res, 'email','Please enter email')
    req.body.email = req.body.email.trim().toLowerCase()
    if(!validator.isEmail(req.body.email)) return stdRes._400(res, 'email','Enter a valid email')
    
    if (!req.body.password) return stdRes._400(res, 'password','Please enter a password')
    req.body.remember = req.body.remember === 'true'
    
    next()

  } catch (error) { stdRes._500(res, error.message) }
}

exports.postRequestPasswordReset = async (req, res, next) => {
  try{
    if (!req.body.email) return stdRes._400(res, 'email','Please enter email')
    req.body.email = req.body.email.trim().toLowerCase()
    if(!validator.isEmail(req.body.email)) return stdRes._400(res, 'email','Enter a valid email')

    next()

  } catch (error) { stdRes._500(res, error.message) }
}

exports.postPasswordReset = async (req, res, next) => {
  try{
    if(!req.body.resetToken) return stdRes._400(res, 'resetToken','Please enter Reset Token')

    const password = req.body.password
    if(!password) return stdRes._400(res, 'password','Please enter a password')
    if(password.length < 6) return stdRes._400(res, 'password', 'The password needs to have 6 or more characters')
  
  next()
  } catch (error) { stdRes._500(res, error.message) }
}
