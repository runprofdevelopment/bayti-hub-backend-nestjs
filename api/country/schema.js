const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    
    type Country {
        id: String
        en: String
        ar: String
      
    }

    type RootQuery {
        listCountries: [Country]!
        listCountryCities(countryId: String!): [City]!
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