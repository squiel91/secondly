module.exports = user => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    admin: user.admin? true : undefined,
    owner: user.admin?.owner? true : undefined
  }
}
