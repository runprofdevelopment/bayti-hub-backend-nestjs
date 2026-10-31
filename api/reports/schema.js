const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    
    type SalesReport {
        total: Float!
        taxes: Float!
        chefsPayment: Float!
        captainsPayment: Float!
        profit: Float!
    }

    type CityReport{
        cityId: String!
        city: City!
        ordersCount: Int!
        chefsProfit: Float!
        captainsProfit: Float!
        appProfit: Float!
    }


    type RootQuery {
        getSalesReport(startDate: DateTime!, endDate: DateTime!): SalesReport!
        getCitiesReport(startDate: DateTime!, endDate: DateTime!): [CityReport]!
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