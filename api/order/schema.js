const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `

    input OrderInput {
        deliveryTime: DateTime!
        paymentMethod: PaymentMethodEnum!
        addressId: String!
    }

    input ChefReviewInput{
        rating: Int!
        review: String!
    }

    type RootQuery {
        listOrders(filter: [Filter]!, pagination: PaginationInput!): [Order]!
        findOrderById(orderId: String!): Order!
        myClientOrders(filter: [Filter]!, pagination: PaginationInput!): [Order]!
        myChefOrders(filter: [Filter]!, pagination: PaginationInput!): [Order]!
        myCaptainOrders(filter: [Filter]!, pagination: PaginationInput!): [Order]!
        listCaptainsInOrderArea(orderId: String!): [Captain]!
    }

    type RootMutation { 
        checkout(orderInput: OrderInput!): JSON!
        decideOrderDelivery(orderId: String!, decision: Boolean!): JSON!
        assignOrderToCaptain(orderId: String!, captainId: String!): JSON!
        cancelAssignOrderToCaptain(orderId: String!, captainId: String!): JSON!

        handOrderToCaptain(orderId: String!, QRCode: String!): JSON!

        closeOrder(orderId: String!): JSON!
        cancelOrder(orderId: String!, notes: String!): JSON!
        closeOrdeAdmin(orderId: String!): JSON!

        reviewChef(orderId: String!, review: ChefReviewInput!): JSON!
        skipReview(orderId: String!): JSON!
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