const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    type Settings {
        phoneNumber: String
        whatsapp: String
        instagram: String
        snapchat: String
        email: String
        address: String
        playStoreClient: String
        playStoreChef: String
        playStoreCaptain: String
        appStoreClient: String
        appStoreChef: String
        appStoreCaptain: String
        androidVersionClient: String
        androidVersionChef: String
        androidVersionCaptain: String
        IOSVersionClient: String
        IOSVersionChef: String
        IOSVersionCaptain: String
        vat: Float
        chefRatio: Float
        chefRadius: Int
        captainRatio: Float
        captainRadius: Int
        minDeliveryFees: Float
        maxDeliveryFees: Float
        priceForKM: Float
        deliveryNotificationTime: Int
        deliveryTime: Int
        promotionPrice: Float
    }

    input SettingsInput {
        phoneNumber: String
        whatsapp: String
        instagram: String
        snapchat: String
        email: String
        address: String
        playStoreClient: String
        playStoreChef: String
        playStoreCaptain: String
        appStoreClient: String
        appStoreChef: String
        appStoreCaptain: String
        androidVersionClient: String
        androidVersionChef: String
        androidVersionCaptain: String
        IOSVersionClient: String
        IOSVersionChef: String
        IOSVersionCaptain: String
        vat: Float
        chefRatio: Float
        chefRadius: Int
        captainRatio: Float
        captainRadius: Int
        minDeliveryFees: Float
        maxDeliveryFees: Float
        priceForKM: Float
        deliveryNotificationTime: Int
        deliveryTime: Int
        promotionPrice: Float
    }

    type TermsAndConditions{
        id: String!
        value: Name!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type PrivacyPolicy{
        id: String!
        value: Name!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    type SavedReply {
        id: String!
        title: String!
        message: String!
    }

    input SavedReplyInput{
        title: String!
        message: String!
    }

    input SavedReplyUpdate{
        title: String
        message: String
    }

    type RootQuery {
        findClientTermsAndConditions: TermsAndConditions!
        findClientPrivacyPolicy: PrivacyPolicy!
        findChefTermsAndConditions: TermsAndConditions!
        findChefPrivacyPolicy: PrivacyPolicy!
        findCaptainTermsAndConditions: TermsAndConditions!
        findCaptainPrivacyPolicy: PrivacyPolicy!
        findSettings: Settings!
        listSavedReplies: [SavedReply]!
    }

    type RootMutation { 
        updateClientTermsAndConditions(termsAndConditions: NameInput!): JSON!
        updateClientPrivacyPolicy(privacyPolicy: NameInput!): JSON!
        updateChefTermsAndConditions(termsAndConditions: NameInput!): JSON!
        updateChefPrivacyPolicy(privacyPolicy: NameInput!): JSON!
        updateCaptainTermsAndConditions(termsAndConditions: NameInput!): JSON!
        updateCaptainPrivacyPolicy(privacyPolicy: NameInput!): JSON!
        updateSettings(settingsInput: SettingsInput!): JSON!
        createSavedReply(savedReply: SavedReplyInput!): JSON!
        editSavedReply(savedReplyId: String!, savedReplyUpdate: SavedReplyUpdate!): JSON!
        removeSavedReply(savedReplyId: String!): JSON!
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