const fs = require('fs')
const path = require('path')

function loadSecrets(name) {
  const file = path.join(__dirname, `secrets.${name}.json`)
  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing ${file}. It stays out of git because this repository is public.`
    )
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

module.exports = { loadSecrets }
