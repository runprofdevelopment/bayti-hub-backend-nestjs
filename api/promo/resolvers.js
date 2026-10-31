const PromoService = require('../../service/promoService')
const sharedResolvers = require('../sharedResolvers')
const PermissionService = require('../../service/permissionService')

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listPromos: async (parent, args, context) => {
            PermissionService.userHasPermission(context.user, 'admin', 'viewPromoCodes')
            const pagination = args.pagination
            const promoService = new PromoService(context.user, context.currentUser, context.language)
            return await promoService.getPromoCodes(pagination)
        },
    },
    RootMutation: {
        addPromoCode: async (root, args, context) => {
            try {
                PermissionService.userHasPermission(context.user, 'admin', 'createPromoCode')
                const promoInput = args.promoInput
                const promoService = new PromoService(context.user, context.currentUser, context.language)
                const promoCode = await promoService.addPromoCode(promoInput)
                return {
                    status: true,
                    result: promoCode,
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
        setPromoCodesStatus: async (root, args, context) => {
            try {
                PermissionService.userHasPermission(context.user, 'admin', 'editPromoCode')
                const promoCodesIds = args.promoCodesIds
                const status = args.status
                const promoService = new PromoService(context.user, context.currentUser, context.language)
                const result = await promoService.setPromoCodesStatus(promoCodesIds, status)
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
        validatePromoCode: async (root, args, context) => {
            try {
                PermissionService.userHasPermission(context.user, 'user', '')
                const promoCode = args.promoCode
                const promoService = new PromoService(context.user, context.currentUser, context.language)
                const discount = await promoService.validatePromoCode(promoCode)
                return {
                    status: true,
                    result: discount,
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