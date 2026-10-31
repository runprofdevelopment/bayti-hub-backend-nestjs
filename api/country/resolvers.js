const CountryService = require('../../service/countryService')
const sharedResolvers = require('../sharedResolvers')
const PermissionService = require('../../service/permissionService')

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listCountries: async (parent, args, context) => {

            const countryService = new CountryService(context.user, context.currentUser, context.language)
            return await countryService.listCountries()
        },
        listCountryCities: async (parent, args, context) => {
            const countryId = args.countryId
            
            const countryService = new CountryService(context.user, context.currentUser, context.language)
            return await countryService.listCities(countryId)
        },
    },
    RootMutation: {


    }
}

module.exports = resolvers