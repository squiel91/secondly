const nodemailer = require('nodemailer')

module.exports = (to, subject, body) => {
  var transporter = nodemailer.createTransport({
    service: 'zoho',
    auth: {
      user: 'info@secondly.store',
      pass: 'unsecure_password'
    },
    tls: {
      rejectUnauthorized: false
    }
  })
  
  var mailOptions = {
    from: '"Secondly" <info@secondly.store>',
    to: to,
    subject: subject,
    html: body
  }
  
  return transporter.sendMail(mailOptions)
}
