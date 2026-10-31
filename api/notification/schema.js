const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    
    input NotificationInput{
        title: NameInput!
        body: NameInput!
        data: NotificationDataInput
        image: String
    }

    input NotificationDataInput{
        key: String!
        value: String!
    }

    enum UserTypeEnum{
        client
        admin
        chef
    }

    type RootQuery {
        listNotifications(pagination: PaginationInput!): [Notification]!
    }

    type RootMutation { 
        sendNotificationToUser(notification: NotificationInput!, userId: String!, userType: UserTypeEnum!): JSON!
        sendNotificationToAllUsers(notification: NotificationInput!, userType: UserTypeEnum!): JSON!
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