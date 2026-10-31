const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `

    type RootQuery {
        listWalletTransactions(walletId: String!, filter: [Filter]!, pagination: PaginationInput!): [Transaction]!
    }

    type RootMutation { 
        temp: JSON!
    }

    schema{
        query: RootQuery
        mutation: RootMutation
    }
`

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

module.exports = schema