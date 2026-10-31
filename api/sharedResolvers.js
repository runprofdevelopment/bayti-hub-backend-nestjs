const GraphQLJSON = require('graphql-type-json')
const { GraphQLDateTime } = require('graphql-iso-date');

const resolvers = {
    JSON: GraphQLJSON,
    DateTime: GraphQLDateTime,
}

module.exports = resolvers