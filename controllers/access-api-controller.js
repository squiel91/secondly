const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const message = require('../utils/message')
const validator = require("validator")
const Register = require('../templates/Register')
const mailer = require('../utils/mailer')
const jwt = require('jsonwebtoken')
const secretToken = process.env.JWT_SECRET

exports.postRegister = async (req, res, next) => {
  try{
      let email = req.body.email.trim().toLowerCase()
      let firstName = req.body.firstName.trim()
      let lastName = req.body.lastName.trim()
      let password = req.body.password
    if(!email){
        return res.status(400).json(message.errorResponse("Email","Please enter email"))
    }
    if(!firstName){
        return res.status(400).json(message.errorResponse("FirstName","Please enter firstName"))
    }
    if(!lastName){
        return res.status(400).json(message.errorResponse("LastName","Please enter lastName"))
    }
    if(!password){
        return res.status(400).json(message.errorResponse("Password","Please enter password"))
    }
    const checkmail = validator.isEmail(email)
    if(checkmail == true){
        await Register.find({email:email}).then(async user =>{
            if(user.length > 0){
                return res.status(400).json(message.errorResponse("Email","There is already an user with that email"))
            }else{
                const pass_length = validator.isLength(password, { min: 6 })
                if(pass_length == true){
                    let hashPassword = await bcrypt.hash(password, 10)

                    let register = new Register({
                        email: email,
                        firstName: firstName,
                        lastName: lastName,
                        password: hashPassword
                    })
                    
                    await register.save().then(savedUser =>{
                        mailer(savedUser.email, 'Welcome Email', `<h2>${firstName}, welcome to Secondly!</h2> `)
                        return res.status(200).json(message.successResponse(savedUser))
                    }).catch(error => {
                        return res.status(400).json(message.errorResponse(error.name,error.message))
                    })
                }else{
                    return res.status(400).json(message.errorResponse("Password","The password needs to have 6 or more characters"))
                }
            }
        }).catch(error => {
            return res.status(400).json(message.errorResponse(error.name,error.message))
        })
    }else{
        return res.status(400).json(message.errorResponse("Email","Enter a valid email"))
    }
  }catch(error){
    return res.status(400).json(message.errorResponse(error.name,error.message))
  }
}

exports.postLogin = async (req, res, next) => {
    try{
        let email = req.body.email.trim().toLowerCase()
        let password = req.body.password
        let remember = req.body.remember
        if(!email){
            return res.status(400).json(message.errorResponse("Email","Please enter email"))
        }
        if(!password){
            return res.status(400).json(message.errorResponse("Password","Please enter password"))
        }
        const checkmail = validator.isEmail(email)
        if(checkmail == true){
        await Register.findOne({email:email}).then(async user =>{
            if(user != null){
                await bcrypt.compare(password, user.password).then(match =>{
                    if(match == true){
                        if(remember && remember == true){
                            req.session.userId = user.id
                        }
                        let firstName = user.firstName
                        mailer(user.email, 'Welcome Email', `<h2>${firstName}, welcome to Secondly!</h2> `)
                        return res.status(200).json(message.successResponse(user))
                    }else{
                        return res.status(400).json(message.errorResponse("Password","The password is incorrect"))
                    }
                })
            }else{
                return res.status(400).json(message.errorResponse("Email","No account associated with this email"))
            }
        })
        }else{
            return res.status(400).json(message.errorResponse("Email","Enter a valid email"))
        }
    }catch(error){
        return res.status(400).json(message.errorResponse(error.name,error.message))
    }
}

exports.postRequestPasswordReset = async (req, res, next) => {
    try{
        let email = req.body.email.trim().toLowerCase()
        if(!email){
            return res.status(400).json(message.errorResponse("Email","Please enter email"))
        }
        const checkmail = validator.isEmail(email)
        if(checkmail == true){
            await Register.findOne({email:email}).then(async user =>{
                if(user != null){
                    const token = await jwt.sign({userId: user._id}, secretToken, { expiresIn: '1h' })
                    user.save()
                    .then(() => {
                        mailer(user.email, 'Password Reset', `
                        <h2>You requested a password reset</h2>
                        <p>Click <a href="http://localhost:3000/account/password-reset/${token}">this link</a> to reset it.</p>
                        <p>If the link doesnt work paste this URL in the browser:</p>
                        <p>http://localhost:3000/account/password-reset/${token}</p>
                        <p>The link is only valid for one hour!</p>
                        `)
                        return res.status(200).json(message.successResponse())
                    })
                }else{
                    return res.status(400).json(message.errorResponse("Email","There is no user with that email"))
                }
            }).catch(error =>{
                return res.status(400).json(message.errorResponse(error.name,error.message))
            })
        }else{
            return res.status(400).json(message.errorResponse("Email","Enter a valid email"))
        }
    }catch(error){
        return res.status(400).json(message.errorResponse(error.name,error.message))
    }
}

exports.postPasswordReset = async (req, res, next) => {
    try{
        const resetToken = req.body.resetToken
        const newPassword = req.body.password
        if(!resetToken){
            return res.status(400).json(message.errorResponse("Reset Token","Please enter Reset Token"))
        }
        if(!newPassword){
            return res.status(400).json(message.errorResponse("Password","Please enter password"))
        }
        const decoded = await jwt.verify(resetToken, secretToken)
        const hashPassword = await bcrypt.hash(newPassword, 10)
        Register.findOne({_id:decoded.userId}).then(user => {
            user.password = hashPassword
            user.save().then(result => {
                return res.status(200).json(message.successResponse(result))
            }).catch(error => {
                return res.status(400).json(message.errorResponse(error.name,error.message))
            })
        }).catch(error => {
            return res.status(400).json(message.errorResponse(error.name,error.message))
        })
    }catch(error){
        return res.status(400).json(message.errorResponse(error.name,error.message))
    }
}