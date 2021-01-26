exports.subject = () => 'Password Reset'

exports.body = (token) => `<h2>You requested a password reset</h2>
<p>Click <a href="http://localhost:3000/account/password-reset/${token}">this link</a> to reset it.</p>
<p>If the link doesnt work paste this URL in the browser:</p>
<p>http://localhost:3000/account/password-reset/${token}</p>
<p>The link is only valid for one hour!</p>`