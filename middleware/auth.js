exports.isAdmin = (req, res, next) => {
  if (!req.user) return res.redirect('/account')
  if (req.user.admin) next()
  else res.redirect('/')
}

exports.isCustomer = (req, res, next) => {
  if (req.user) {
    next()
  } else {
    res.redirect('/account')
  }
}