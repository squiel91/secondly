const Order = require('../models/Order')
const Category = require('../models/Category')
const User = require('../models/User')

const Cart = require('../models/Cart')
const env = require('../utils/env')

exports.setupAuth = async (req, res, next) => {
  res.locals.csrfToken = env.isDev ? 'disabled in development' : req.csrfToken()

  if (req.session.userId) {
    req.user = await User.findById(req.session.userId)
    res.locals.user = req.user
  }
  req.cart = new Cart(req)
  res.locals.cartItemQty = req.cart.getItemsQuantity()

  res.locals.listedCategories = await Category.find({ listed: true })
  next()
}

exports.getRegister = (req, res, next) => {
  if (req.user) res.redirect('/account')
  res.render('access/register.ejs')
}

exports.getLogin = (req, res, next) => {
  if (req.user) res.redirect('/account')
  res.render('access/login.ejs')
}

exports.getAccount = async (req, res, next) => {
  if (!req.user) res.redirect('/account/login')

  // retrive user orders
  const orders = await Order.find({ user: req.user })
  res.render('store/account.ejs', { orders })
}

exports.getRequestPasswordReset = (req, res, next) => {
  res.render('access/request-password-reset.ejs', { errorMessages: req.flash('error') })
}

exports.getPasswordReset = async (req, res, next) => {
  const passResetToken = req.params.resetToken
  res.render('access/password-reset.ejs', { passResetToken })
}

// exports.postLogin = (req, res, next) => {
//   [ fields, allValid ] = prefills.create(req)

//   if (!allValid) {
//     fields._returnStatus = 422
//     req.flash('fields', fields)
//     res.redirect('/account')
//   } else {
//     return User.findOne({ email: req.body.loginEmail.trim().toLowerCase() })
//     .then(user => {
//       if (!user) {
//         fields.loginEmail.error = 'No account associated with this email'
//         fields._returnStatus = 422
//         req.flash('fields', fields)
//         res.redirect('/account')
//       } else {
//         bcrypt.compare(req.body.loginPass, user.passHash)
//           .then(match => {
//             if (match) {
//               req.session.userId = user.id
//               req.session.save(() => {
//                 if (user.admin) res.redirect('/admin')
//                 else res.redirect('/')
//               })
//             } else {
//               fields.loginPass.error = 'The password is incorrect'
//               fields._returnStatus = 422
//               req.flash('fields', fields)
//               res.redirect('/account')
//             }
//           })
//           .catch(err => {
//             console.log(err)
//           })
//       }
//     })
//     .catch(err => {
//       console.log(err)
//     })
//   }
// }

// exports.postRegister = (req, res, next) => {
//   [ fields, allValid ] = prefills.create(req)
//   if (!allValid) {
//     fields._returnStatus = 422
//     req.flash('fields', fields)
//     res.redirect('/account')
//   } else {
//     bcrypt.hash(req.body.registerPass, 12)
//       .then(passHash => {
//         this.user = new User({
//           firstName: req.body.registerFirstName.trim(),
//           lastName: req.body.registerLastName.trim(),
//           email: req.body.registerEmail.trim().toLowerCase(),
//           passHash
//         })
//         return this.user.save()
//       })
//       .then(result => {
//         req.session.userId = this.user.id
//         res.redirect('/')
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }
// }

// exports.postLogout = (req, res, next) => {
//   req.session.destroy(err => {
//     res.redirect('/')
//   })
// }

// exports.postRequestPasswordReset = (req, res, next) => {
//   User.findOne({ email: req.body.email })
//     .then(user => {
//       if (user) {
//         crypto.randomBytes(32, (err, buffer) => {
//           if (err) {
//             return console.log(err)
//           } else {
//             const token = buffer.toString('hex');
//             user.resetToken = token
//             user.resetTokenExp = Date.now() + 3600000 // 1 hour
//             user.save()
//               .then(result => {
//                 res.redirect('/')
//                 mailer(user.email, 'Password Reset', `
//                 <h2>You requested a password reset</h2>
//                 <p>Click <a href='htp ://localhost:3000/account/password-reset/${token}'>hi s link</a> to reset it.</p>
//                 <p>If the link doesnt work paste this URL in the browser:</p>
//                 <p>http://localhost:3000/account/password-reset/${token}</p>
//                 <p>The link is only valid for one hour!</p>
//                 `)
//               })
//           }
//         })
//       } else {
//         req.flash('error', 'There is no user with that email')
//         res.redirect('account/request-password-reset')
//       }
//     })
//     .catch(error => {
//       console.log(error)
//     })
// }

// exports.postPasswordReset = (req, res, next) => {
//   const userId = req.body.userId
//   const resetToken = req.body.resetToken
//   const newPassword = req.body.newPassword
//   console.log(userId, resetToken, newPassword)
//   User.findOne({
//     _id: userId,
//     resetToken,
//     resetTokenExp: {$gt: Date.now() }
//   })
//     .then(user => {
//       if (user) {
//         bcrypt.hash(newPassword, 12)
//           .then(passHash => {
//             user.passHash = passHash
//             user.resetToken = undefined
//             user.resetTokenExp = undefined
//             user.save()
//               .then(result => {
//                 res.redirect('/account')
//               })
//               .catch(error => {
//                 console.log(error)
//               })
//           })
//       } else {
//         res.redirect('/')
//       }
//     })
//     .catch(error => {
//       console.log(error)
//     })
// }
