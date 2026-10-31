let env = process.env.APP_ENV

if (!env) {
  try {
    const functions = require('firebase-functions')
    env = functions.config().env && functions.config().env.value
  } catch (error) {
    env = null
  }
}

env = env || 'staging'
const selected = require(`./${env}`)

module.exports = selected
