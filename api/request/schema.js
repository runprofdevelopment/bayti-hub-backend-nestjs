const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    
    type RootQuery {
        userRequests(pagination: PaginationInput!): [Request]!
        listRequests(filter: [Filter]!, pagination: PaginationInput!): [Request]!
    }

    type RootMutation { 
        addWithdrawRequest(requestInput: RequestInput!): JSON!
        decideWithdrawRequest(requestId: String!, acceptRequest: Boolean!, transactionTimeStamp: DateTime, notes: String): JSON!
        confirmWithdrawRequest(requestId: String!, transactionId: String!, transactionUrl: String!): JSON!
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