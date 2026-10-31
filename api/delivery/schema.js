const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    
    type DeliveryCompany {
        id: String!
        nameEn: String!
        nameAr: String!
        price: Float!
        logo: String

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    input DeliveryCompanyInput {
        nameEn: String!
        nameAr: String!
        price: Float!
    }

    type RootQuery {
        deliveryCompanies: [DeliveryCompany]!
        getDeliveryCompaniesByIds(deliveryCompaniesIds: [String]!): [DeliveryCompany]!
    }

    type RootMutation { 
        addDeliveryCompany(deliveryCompanyInput: DeliveryCompanyInput!): JSON!
        removeDeliveryCompany(deliveryCompanyId: String!): JSON!
        setDeliveryCompanyLogo(deliveryCompanyId: String!, logo: String!): JSON!
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