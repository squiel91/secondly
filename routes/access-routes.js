const { response } = require('express')
const express = require('express')
const router = express.Router()

const accessController = require('../controllers/access-controller')
const accessValidator = require('../validators/access-validator')

router.use(accessController.setupAuth) // loads the user if logged

router.get('/account', accessController.getAccount)
router.get('/account/request-password-reset', accessController.getRequestPasswordReset)
router.get('/account/password-reset/:resetToken', accessController.getPasswordReset) // from the email

router.post('/login', accessValidator.postLogin, accessController.postLogin)
router.post('/logout', accessController.postLogout)
router.post('/register', accessValidator.postRegister, accessController.postRegister)
router.post('/request-password-reset', accessController.postRequestPasswordReset)
router.post('/password-reset', accessController.postPasswordReset)

module.exports = router