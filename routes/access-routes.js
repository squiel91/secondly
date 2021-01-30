const express = require('express')
const router = express.Router()

const accessController = require('../controllers/access-controller')

router.use(accessController.setupAuth) // loads the user if logged

router.get('/account', accessController.getAccount)
router.get('/account/request-password-reset', accessController.getRequestPasswordReset)
router.get('/account/password-reset/:resetToken', accessController.getPasswordReset) // from the email

router.post('/login', accessController.postLogin)
router.post('/logout', accessController.postLogout)
router.post('/register', accessController.postRegister)
router.post('/request-password-reset', accessController.postRequestPasswordReset)
router.post('/password-reset', accessController.postPasswordReset)

module.exports = router