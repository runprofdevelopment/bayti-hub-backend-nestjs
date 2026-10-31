const {i18n} = require('../i18n')

module.exports = class CustomError extends Error{
    constructor(language, messageCode){
        const message = i18n(language, messageCode)
        super(message)
        this.code = 500
    }
}