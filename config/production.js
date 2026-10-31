const admin = require('firebase-admin')
const { initializeApp } = require('firebase/app')
const { loadSecrets } = require('./load-secrets')

const secrets = loadSecrets('production')
const serviceAccount = secrets.serviceAccount

const init = function() {
  if (admin.apps.length) return
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: secrets.firebaseConfig.databaseURL,
  })
  initializeApp(secrets.firebaseConfig)
}

module.exports = {
  init,
  serviceAccount,
  constants: secrets.constants,
  alraghi: secrets.alraghi,
}
