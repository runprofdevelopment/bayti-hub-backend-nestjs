const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    
    type Admin {
        id: String!
        authenticationUid: String!
        userName: String
        phoneNumber: String
        email: String!
        lang: Lang!
        role: String!
        avatar: String
        pagesAccess: [String]! 
        
        isRemoved: Boolean!
        isEnabled: Boolean!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    input AdminInput{
        email: String!
        password: String!
        pagesAccess: [String]!
    }

    input AdminUpdate{
        userName: String
        phoneNumber: String
        lang: Lang
        avatar: String
        pagesAccess: [String]
    }

    type AppWallet {
        id: String!
        balance: Float!
        actualBalance: Float!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type RootQuery {
        findMeAdmin: Admin!
        findAdmin(adminId: String!): Admin!
        listAdmins(filter: [Filter]!, pagination: PaginationInput!): [Admin]!
        authStorageToken: String!
        listInWalletTransactionsApp(filter: [Filter]!, pagination: PaginationInput!): [Transaction]!
        listOutWalletTransactionsApp(filter: [Filter]!, pagination: PaginationInput!): [Transaction]!
        findAppWallet: AppWallet!
    }

    type RootMutation { 
        createAdmin(adminInput: AdminInput!): JSON!
        editMeAdmin(adminUpdate: AdminUpdate!): JSON!
        editAdmin(adminId: String!, adminUpdate: AdminUpdate!): JSON!
        setAdminsStatus(adminsIds: [String]!, status: Boolean!): JSON!
        resetAdminPassword(adminId: String!, password: String!): JSON!
        resetMyPassword(oldPassword: String!, newPassword: String!): JSON!
        removeAdmins(adminsIds: [String]!): JSON!
        removeMeAdmin: JSON!
        rechargeAppWallet(amount: Float): JSON!
        withdrawFromAppWallet(amount: Float!, transactionNo: String!): JSON!
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