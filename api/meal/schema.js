const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `

    input MealInput{
        name: NameInput!
        description: NameInput!
        categoryId: String!
        sectionId: String!
        price: Float!
        video: String
        images: [String]!
        orderBefore: OrderBeforeEnum!
        addons: [AddonInput]!
        sizes: [MealSizeInput]!
    }

    input MealUpdate{
        name: NameInput
        description: NameInput
        categoryId: String
        sectionId: String
        price: Float
        video: String
        images: [String]
        orderBefore: OrderBeforeEnum
        addons: [AddonInput]
        sizes: [MealSizeInput]
    }

    input AddonInput{
        id: String!
        name: NameInput!
        price: Float!
    }

    input MealSizeInput{
        id: String!
        name: NameInput!
        price: Float!
    }

    type RootQuery {
        findMeal(chefId: String!, mealId: String!): Meal!
        myMeals(filter: [Filter]!, pagination: PaginationInput!):[Meal]!
        listChefMeals(chefId: String!, filter: [Filter]!, pagination: PaginationInput!): [Meal]!
    }

    type RootMutation { 
        createMeal(mealInput: MealInput!): JSON!
        editMyMeal(mealId: String!, mealUpdate: MealUpdate!): JSON!
        editMeal(chefId: String!, mealId: String!, mealUpdate: MealUpdate!): JSON!
        removeMyMeal(mealId: String!): JSON!
        removeMeal(chefId: String!, mealId: String!): JSON!
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