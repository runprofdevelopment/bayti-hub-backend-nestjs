const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `

    input CartItemInput{
        chefId: String!
        mealId: String!
        quantity: Int!
        sizeId: String!
        addons: [SelectedAddonInput]!
    }

    input SelectedAddonInput{
        id: String!
        quantity: Int!
    }

    type RootQuery {
        myCart(addressId: String): Cart
        findClientCart(clientId: String!): Cart!
        findMyCartSchedule: [DayShift]!
        findMyCartDeliveryFees(addressId: String!): Float!
    }

    type RootMutation { 
        addItemToCart(cartItemInput: CartItemInput!): JSON!
        setItemCount(itemId: String!, quantity: Int!): JSON!
        setAddonCount(itemId: String!, addonId: String!, quantity: Int!): JSON!
        removeItemFromCart(itemId: String!): JSON!
        removeAddonFromCart(itemId: String!, addonId: String!): JSON!
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