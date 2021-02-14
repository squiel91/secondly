exports.subject = 'Order Received'

exports.body = (billed, guest, orderId) => `
<h2>Your order for a total of $${billed} has been received!<h2>
It is now being processes and we will notify you as soon as it is shipped (24 hours max.).<br>

${!guest ? 'You can check the order status at https://secondly.store/admin/orders/' + orderId + '(you need to be logged in).<br><br>' : '<br>'}

The Secondly Team
Email: support@secondly.store
Tel: (773) 986 4084`
