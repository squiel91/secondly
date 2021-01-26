const env = process.env.NODE_ENV?.toLowerCase()

module.exports = {
  raw: env,
  isDev: !['stagging', 'production'].includes(env),
  isStag: env == 'stagging',
  isProd: env == 'production'
}
