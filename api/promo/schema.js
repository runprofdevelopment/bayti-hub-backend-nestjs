const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    
    type Promo {
        id: String!
        code: String!
        startDate: DateTime!
        endDate: DateTime!
        discount: Int!
        maxUses: Int!
        totalUses: Int!
        status: String!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    input PromoInput {
        code: String!
        startDate: DateTime!
        endDate: DateTime!
        discount: Int!
        maxUses: Int!
    }

    type RootQuery {
        listPromos(pagination: PaginationInput!): [Promo]!
    }

    type RootMutation { 
        addPromoCode(promoInput: PromoInput!): JSON!
        setPromoCodesStatus(promoCodesIds: [String]!, status: Boolean!): JSON!
        validatePromoCode(promoCode: String!): JSON!
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