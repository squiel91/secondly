const express = require('express')
const router = express.Router()

const accessApiController = require('../controllers/access-api-controller')

router.post('/register', accessApiController.postRegister)
router.post('/login', accessApiController.postLogin)
router.post('/request-password-reset', accessApiController.postRequestPasswordReset)
router.post('/reset-password', accessApiController.postPasswordReset)

module.exports = router