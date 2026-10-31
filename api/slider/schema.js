const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');
const sharedTypes = require('../sharedTypes')

const typeDefs = sharedTypes + `
    
    type Slider {
        id: String!
        title: Name!
        description: Name!
        imageEn: String!
        imageAr: String!

        createdBy: String
        createdAt: DateTime
        updatedBy: String
        updatedAt: DateTime
    }

    input SliderInput {
        id: String!
        title: NameInput!
        description: NameInput!
        imageEn: String!
        imageAr: String!
    }

    input SliderUpdate {
        title: NameInput
        description: NameInput
        imageEn: String
        imageAr: String
    }

    type RootQuery {
        listSliders: [Slider]!
        findSliderById(sliderId: String!): Slider!
    }

    type RootMutation { 
        addSlider(sliderInput: SliderInput!): JSON!
        removeSlider(sliderId: String!): JSON!
        updateSlider(sliderId: String!, sliderUpdate: SliderUpdate!): JSON!
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