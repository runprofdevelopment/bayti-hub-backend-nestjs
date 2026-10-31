const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `

    input ClientInput {
        fullName: String
        email: String
        phoneNumber: String!
        deviceToken: String!
        lang: Lang!
    }

    input ClientUpdate{
        fullName: String
        phoneNumber: String
        email: String
        lang: Lang
        avatar: String
    }

    type ClientWallet {
        id: String!
        clientId: String!
        balance: Float!
        actualBalance: Float!

        dayAmount: Float
        weekAmount: Float
        monthAmount: Float
        yearAmount: Float
        client: Client

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type RootQuery {
        findMeClient: Client
        findClientById(clientId: String!): Client!
        myAddressesClient: [Address]!
        myDefaultAddressClient: Address
        
        myNotificationsClient(pagination: PaginationInput!): [Notification]!
        findNotificationClient(notificationId: String!): Notification!

        listClients(filter: [Filter]!, pagination: PaginationInput!): [Client]!
        listClientAddresses(clientId: String!): [Address]!

        findMyWalletClient: ClientWallet!
        findClientWallet(clientId: String!): ClientWallet!
        listClientsWallets(filter: [Filter]!, pagination: PaginationInput!): [ClientWallet]!

        myInWalletTransactionsClient(pagination: PaginationInput!): [Transaction]!
        myOutWalletTransactionsClient(pagination: PaginationInput!): [Transaction]!

        listInWalletTransactionsClient(clientId: String!, filter: [Filter]!, pagination: PaginationInput!): [Transaction]!
        listOutWalletTransactionsClient(clientId: String!, filter: [Filter]!, pagination: PaginationInput!): [Transaction]!

        myFavouriteChefs: [Chef]!
        myFavouriteChefsIds: [String]!
    }

    type RootMutation { 
        fixAddresses: Boolean
        createMeClient(clientInput: ClientInput!): JSON!
        editMeClient(clientUpdate: ClientUpdate!): JSON!
        setNotificationStatus(notificationStatus: Boolean!): JSON!
        removeMeClient: JSON!
        removeClients(clientsIds: [String]!): JSON!

        addAddress(address: AddressInput): JSON!
        removeAddress(addressId: String!): JSON!
        editAddress(addressId: String!, addressUpdate: AddressUpdate!): JSON!
        setDefaultAddress(addressId: String!): JSON!
        
        login(deviceToken: String!): JSON!
        logout(deviceToken: String!): JSON!

        readNotificationClient(notificationId: String!): JSON!
        removeNotificationClient(notificationId: String!): JSON!

        setClientsStatus(clientsIds: [String]!, status: Boolean!): JSON!

        rechargeClientWallet(amount: Float): JSON!           
        rechargeClientWalletByAdmin(clientId: String!, amount: Float!, notes: NameInput!): JSON!  

        addChefToFavourites(chefId: String!): JSON!
        removeChefFromFavourites(chefId: String!): JSON!

        setClientDashboardReview(clientId: String!, reviewInput: DashboardReviewInput!): JSON!
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