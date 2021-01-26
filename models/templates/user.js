module.exports = user => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    admin: user.admin? true : undefined,
    owner: user.admin?.owner? true : undefined
  }
}
