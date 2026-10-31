const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `

type RootQuery {
    listVehicles: [Vehicle]!
    findVehicleById(vehicleId: String!): Vehicle!
}

type RootMutation { 
    createVehicle(vehicleInput: NameInput!): JSON!
    removeVehicle(vehicleId: String!): JSON!
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