const express = require('express')
const router = express.Router()

const accessApiValidator = require('../controllers/validators/access-api-validator')
const accessApiController = require('../controllers/access-api-controller')

router.post('/register', accessApiValidator.postRegister, accessApiController.postRegister)
router.post('/login', accessApiValidator.postLogin, accessApiController.postLogin)
router.post('/request-password-reset', accessApiValidator.postRequestPasswordReset , accessApiController.postRequestPasswordReset)
router.post('/reset-password', accessApiValidator.postPasswordReset , accessApiController.postPasswordReset)

module.exports = router