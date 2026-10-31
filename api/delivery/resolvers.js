const DeliveryService = require('../../service/deliveryService')
const sharedResolvers = require('../sharedResolvers')
const PermissionService = require('../../service/permissionService')

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        deliveryCompanies: async (parent, args, context) => {
            const deliveryService = new DeliveryService(context.user, context.currentUser, context.language)
            const deliveryCompanies = await deliveryService.getDeliveryCompanies()

            return deliveryCompanies
        },
        getDeliveryCompaniesByIds: async (parent, args, context) => {
            const deliveryCompaniesIds = args.deliveryCompaniesIds
            const deliveryService = new DeliveryService(context.user, context.currentUser, context.language)
            const deliveryCompanies = await deliveryService.getDeliveryCompaniesByIds(deliveryCompaniesIds)

            return deliveryCompanies
        },
    },
    RootMutation: {
        addDeliveryCompany: async (root, args, context) => {
            try {
                const deliveryCompanyInput = args.deliveryCompanyInput

                const deliveryService = new DeliveryService(context.user, context.currentUser, context.language)
                const deliveryCompany = await deliveryService.addDeliveryCompany(deliveryCompanyInput)

                return {
                    status: true,
                    result: deliveryCompany,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        removeDeliveryCompany: async (root, args, context) => {
            try {
                const deliveryCompanyId = args.deliveryCompanyId

                const deliveryService = new DeliveryService(context.user, context.currentUser, context.language)
                const result = await deliveryService.removeDeliveryCompany(deliveryCompanyId)

                return {
                    status: true,
                    result: result,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },
        setDeliveryCompanyLogo: async (root, args, context) => {
            try {
                const deliveryCompanyId = args.deliveryCompanyId
                const logo = args.logo

                const deliveryService = new DeliveryService(context.user, context.currentUser, context.language)
                const result = await deliveryService.setDeliveryCompanyLogo(deliveryCompanyId, logo)

                return {
                    status: true,
                    result: result,
                    error: null
                }
            } catch (error) {
                return {
                    status: false,
                    result: null,
                    error: {
                        code: error.code || 'SERVER_ERROR',
                        message: error.message
                    }
                }
            }
        },

    }
}

module.exports = resolvers