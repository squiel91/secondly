exports.subject = 'New Order Received'

exports.body = (firstName, lastName, billed, orderId) => `
${firstName} ${lastName} placed a new order for a total of $${billed}.<br><br>
You may check it at: https://secondly.store/admin/orders/${orderId}`
