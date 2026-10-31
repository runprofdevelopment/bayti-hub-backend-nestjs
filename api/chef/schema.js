const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `

    input KitchenInput{
        kitchenName: NameInput!
        logo: String
        cover: String
        minOrderAmount: Float!
        schedule: ScheduleInput!
        timeZone: Int!
        categoriesIds: [String]!
    }

    input ScheduleInput {
        saturday: DayShiftInput!
        sunday: DayShiftInput!
        monday: DayShiftInput!
        tuesday: DayShiftInput!
        wednesday: DayShiftInput!
        thursday: DayShiftInput!
        friday: DayShiftInput!
    }

    input DayShiftInput {
        working: Boolean!
        startTime: Time!
        endTime: Time!
    }

    input SectionInput {
        id: String!
        name: NameInput!
    }

    input ChefInput {
        fullName: String!
        phoneNumber: String!
        email: String
        deviceToken: String!
        lang: Lang!
        idCard: String
        freelanceCertificate: String
        taxNumber: String
        medicalCertificate: String
    }

    input ChefUpdate{
        fullName: String
        email: String
        phoneNumber: String
        avatar: String
        lang: Lang
        idCard: String
        freelanceCertificate: String
        taxNumber: String
        medicalCertificate: String
    }

    type ChefWallet {
        id: String!
        chefId: String!
        balance: Float!
        actualBalance: Float!

        dayAmount: Float
        weekAmount: Float
        monthAmount: Float
        yearAmount: Float
        chef: Chef

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type Promotion{
        id: String!
        chefId: String!
        chef: Chef
        status: PromotionStatusEnum!
        
        startDate: String!
        endDate: String!
        amount: Float!
        daysCount: Int!

        createdAt: DateTime
        createdBy: String
        updatedAt: DateTime
        updatedBy: String
    }

    enum PromotionStatusEnum{
        shadow
        success
    }

    input PromotionInput {
        startDate: String!
        endDate: String!
        paymentMethod: PaymentMethodEnum!
    }

    type RootQuery {
        # chef find
        findMeChef: Chef
        listChefs(filter: [Filter]!, pagination: PaginationInput!): [Chef]!
        findChefById(chefId: String!): Chef!

        # chef notification
        myNotificationsChef(pagination: PaginationInput!): [Notification]!
        listChefNotifications(chefId: String!, pagination: PaginationInput!): [Notification]!

        # chef wallet
        findMyWalletChef: ChefWallet!
        findChefWallet(chefId: String!): ChefWallet!
        listChefsWallets(filter: [Filter]!, pagination: PaginationInput!): [ChefWallet]!

        # chef bank account
        bankAccountsChef: [BankAccount]!
        defaultBankAccountChef: BankAccount
        listChefBankAccounts(chefId: String!): [BankAccount]!

        # chef transactions
        myInWalletTransactionsChef(pagination: PaginationInput!): [Transaction]!
        myOutWalletTransactionsChef(pagination: PaginationInput!): [Transaction]!

        listInWalletTransactionsChef(chefId: String!, filter: [Filter]!, pagination: PaginationInput!): [Transaction]!
        listOutWalletTransactionsChef(chefId: String!, filter: [Filter]!, pagination: PaginationInput!): [Transaction]!

        myChefRequests(pagination: PaginationInput!): [Request]!
        listChefsRequests(filter: [Filter]!, pagination: PaginationInput!): [Request]!

        listMyReviewsChef(filter: [Filter]!, pagination: PaginationInput!): [ChefReview]!
        listChefReviews(chefId: String!, filter: [Filter]!, pagination: PaginationInput!): [ChefReview]!

        listPromotions(filter: [Filter]!, pagination: PaginationInput!): [Promotion]!
        myChefPromotions(filter: [Filter]!, pagination: PaginationInput!): [Promotion]!

    }

    type RootMutation { 
        # create chef
        createMeChef(chefInput: ChefInput!): JSON!

        # Edit chef
        editMeChef(chefUpdate: ChefUpdate!): JSON!

        # Remove chef
        removeChefs (chefsIds: [String]!): JSON!
        removeMeChef: JSON!

        # Address chef
        setChefAddress(address: AddressInput): JSON!

        # Bank account chef
        addBankAccountChef(bankAccount: BankAccountInput!): JSON!
        removeBankAccountChef(bankAccountId: String!): JSON!
        editBankAccountChef(bankAccountId: String!, bankAccountUpdate: BankAccountUpdate!): JSON!
        setDefaultBankAccountChef(bankAccountId: String!): JSON!

        # Authentication chef
        loginChef(deviceToken: String!): JSON!
        logoutChef(deviceToken: String!): JSON!
        
        # kitchen
        setMyKitchen(kitchenInput: KitchenInput!): JSON!
        setKitchen(chefId: String!, kitchenInput: KitchenInput!): JSON!
        setMySections(sections: [SectionInput]!): JSON!
        setKitchenSections(chefId: String!, sections: [SectionInput]!): JSON!

        # notification chef
        readNotificationChef(notificationId: String!): JSON!
        removeNotificationChef(notificationId: String!): JSON!

        # enable/ disable chef
        setChefsStatus(chefsIds: [String]!, status: Boolean!): JSON!

        # wallet chef
        rechargeChefWallet(amount: Float): JSON!
        rechargeChefWalletByAdmin(chefId: String!, amount: Float!, notes: NameInput!): JSON!  

        # withdraw chef
        addWithdrawRequestChef(requestInput: RequestInput!): JSON!
        decideWithdrawRequestChef(requestId: String!, acceptRequest: Boolean!, transactionTimeStamp: DateTime, notes: String): JSON!
        confirmWithdrawRequestChef(requestId: String!, transactionId: String!, transactionUrl: String!): JSON!

        # promotion
        promotoHome(promotionInput: PromotionInput!): JSON!
        removePromotion(promotionId: String!): JSON!

        setChefDashboardReview(chefId: String!, reviewInput: DashboardReviewInput!): JSON!
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