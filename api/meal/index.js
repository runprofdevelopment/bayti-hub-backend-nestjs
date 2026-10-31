const express = require('express')
const cors = require('cors')
const { graphqlHTTP } = require('express-graphql')
const schema = require('./schema')
const authMiddleware = require('../../auth/authMiddleware')

const app = express()
app.use(cors({ origin: true }));


app.use('/', authMiddleware, graphqlHTTP((req) => ({
    schema,
    graphiql: true,
    context: {
        user: req.user,
        currentUser: req.currentUser,
        language: req.language
    },
    formatError(error) {
        return {
            message: error.message,
            code: error.originalError && error.originalError.code,
            locations: error.locations,
            path: error.path,
        };
    }

})
))

module.exports = app