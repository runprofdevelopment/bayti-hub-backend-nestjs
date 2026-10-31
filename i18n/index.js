const en = require('./en')
const ar = require('./ar')
const _get = require('lodash/get')

const languages = {
    en,
    ar
}

const i18n = (language, key) => {
    const message = _get(languages[language], key)

    if(!message ){
        return key
    }

    return message
}

exports.i18n = i18n