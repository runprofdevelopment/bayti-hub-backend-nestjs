const types = require('./types')
const AbstractEntityModel = require('./abstractEntityModel')

module.exports = class User extends AbstractEntityModel {
    constructor() {
        super('user', 'user', {
            userName: new types.String(null, 255),
            phoneNumber: new types.String(null, 24),
            email: new types.String(null, 255),
            seller: new types.Boolean(),
            avatar: new types.File(),
            deviceTokens: new types.Json(),
            authenticationUid: new types.String(null, 255),
            lang: new types.String(null, 24)
        })
    }

};