const node_env = process.env.NODE_ENV?.toLowerCase()

module.exports = {
  raw: node_env,
  isDev: !['stagging', 'production'].includes(node_env),
  isStag: node_env == 'stagging',
  isProd: node_env == 'production',
  port: process.env.PORT || 3000
}
