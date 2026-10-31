const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    
    type Category {
        id: String!
        name: Name!
        image: String
        order: Int!

        isRemoved: Boolean!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    input CategoryUpdate{
        name: NameInput
        image: String
    }

    type RootQuery {
        listCategories(filter: [Filter]!, pagination: PaginationInput!): [Category]!
        listAllCategories: [Category]!
        findCategoryById(categoryId: String!): Category!
    }

    type RootMutation { 
       createCategory(name: NameInput!): JSON!
       removeCategory(categoryId: String!): JSON!
       setCategoryImage(categoryId: String!, image: String!): JSON!
       editCategory(categoryId: String!, categoryUpdate: CategoryUpdate!): JSON!
       arrangeCategories(categoriesIds: [String]!): JSON!
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