const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    
    
    enum CaptainStatusEnum{
        pendingAdd
        pendingUpdate
        enabled
        rejected
        disabled
    }

    input CaptainInput {
        fullName: String
        phoneNumber: String!
        lat: Float!
        lng: Float!
        email: String
        deviceToken: String!
        lang: Lang!
        vehicleId: String!
        license: String
        vehicleLicense: String
    }

    input CaptainUpdate{
        fullName: String
        phoneNumber: String
        email: String
        lang: Lang
        avatar: String
        license: String
        vehicleLicense: String
    }

    type CaptainWallet {
        id: String!
        captainId: String!
        balance: Float!
        actualBalance: Float!

        dayAmount: Float
        weekAmount: Float
        monthAmount: Float
        yearAmount: Float

        captain: Captain

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type RootQuery {
        findMeCaptain: Captain
        findCaptainById(captainId: String!): Captain!
        listCaptains(filter: [Filter]!, pagination: PaginationInput!): [Captain]!

        myNotificationsCaptain(pagination: PaginationInput!): [Notification]!
        findNotificationCaptain(notificationId: String!): Notification!

        findMyWalletCaptain: CaptainWallet!
        findCaptainWallet(captainId: String!): CaptainWallet!
        listCaptainsWallets(filter: [Filter]!, pagination: PaginationInput!): [CaptainWallet]!

        bankAccountsCaptain: [BankAccount]!
        defaultBankAccountCaptain: BankAccount
        listCaptainBankAccounts(captainId: String!): [BankAccount]!
        myInWalletTransactionsCaptain(pagination: PaginationInput!): [Transaction]!
        myOutWalletTransactionsCaptain(pagination: PaginationInput!): [Transaction]!
        myCaptainRequests(pagination: PaginationInput!): [Request]!
        listCaptainsRequests(filter: [Filter]!, pagination: PaginationInput): [Request]!

        listInWalletTransactionsCaptain(captainId: String!, filter: [Filter]!, pagination: PaginationInput!): [Transaction]!
        listOutWalletTransactionsCaptain(captainId: String!, filter: [Filter]!, pagination: PaginationInput!): [Transaction]!
    }

    type RootMutation { 
        createMeCaptain(captainInput: CaptainInput!): JSON!
        editMeCaptain(captainUpdate: CaptainUpdate!): JSON!
        setNotificationStatusCaptain(notificationStatus: Boolean!): JSON!
        removeMeCaptain: JSON!
        removeCaptains(captainsIds: [String]!): JSON!
        
        loginCaptain(deviceToken: String!): JSON!
        logoutCaptain(deviceToken: String!): JSON!

        readNotificationCaptain(notificationId: String!): JSON!
        removeNotificationCaptain(notificationId: String!): JSON!

        setCaptainsStatus(captainsIds: [String]!, status: Boolean!): JSON!

        addBankAccountCaptain(bankAccount: BankAccountInput!): JSON!
        removeBankAccountCaptain(bankAccountId: String!): JSON!
        editBankAccountCaptain(bankAccountId: String!, bankAccountUpdate: BankAccountUpdate!): JSON!
        setDefaultBankAccountCaptain(bankAccountId: String!): JSON!

        rechargeCaptainWallet(amount: Float): JSON!
        rechargeCaptainWalletByAdmin(captainId: String!, amount: Float!, notes: NameInput!): JSON!  

        addWithdrawRequestCaptain(requestInput: RequestInput!): JSON!

        setCurrentLocation(lat: Float!, lng: Float!): JSON!

        decideWithdrawRequestCaptain(requestId: String!, acceptRequest: Boolean!, transactionTimeStamp: DateTime, notes: String): JSON!
        confirmWithdrawRequestCaptain(requestId: String!, transactionId: String!, transactionUrl: String!): JSON!

        setCaptainDashboardReview(captainId: String!, reviewInput: DashboardReviewInput!): JSON!
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