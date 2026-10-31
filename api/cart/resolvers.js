const CartEditService = require('../../service/cart/cartEditService');
const CartFindService = require('../../service/cart/cartFindService');
const CartScheduleService = require('../../service/cart/cartScheduleService');
const CartDeliveryService = require('../../service/cart/cartDeliveryService');
const sharedResolvers = require('../sharedResolvers');

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        myCart: async (parent, args, context) => {
            const cartFindService = new CartFindService(context.currentUser, context.language);
            const Cart = await cartFindService.findDetailedCartByAuthId(context.currentUser.uid, args.addressId);
            return Cart
        },
        findClientCart: async (parent, args, context) => {
            const cartFindService = new CartFindService(context.currentUser, context.language);
            return await cartFindService.findCartByClientId(args.clientId);
        },
        findMyCartSchedule: async (parent, args, context) => {
            const cartScheduleService = new CartScheduleService(context.currentUser, context.language);
            return await cartScheduleService.findCartSchedule(context.currentUser.uid);
        },
        findMyCartDeliveryFees: async (parent, args, context) => {
            const cartDeliveryService = new CartDeliveryService(context.currentUser, context.language);
            return await cartDeliveryService.findDeliveryFees(context.currentUser.uid, args.addressId);
        },
    },
    RootMutation: {
        addItemToCart: async (root, args, context) => {
            try {
                const cartEditService = new CartEditService(context.currentUser, context.language);
                const result = await cartEditService.addItemToCart(context.currentUser.uid, args.cartItemInput);
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
        setItemCount: async (root, args, context) => {
            try {
                const cartEditService = new CartEditService(context.currentUser, context.language);
                const result = await cartEditService.setItemCount(context.currentUser.uid, args.itemId, args.quantity);
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
        setAddonCount: async (root, args, context) => {
            try {
                const cartEditService = new CartEditService(context.currentUser, context.language);
                const result = await cartEditService.setAddonCount(context.currentUser.uid, args.itemId, args.addonId, args.quantity);
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
        removeItemFromCart: async (root, args, context) => {
            try {
                const cartEditService = new CartEditService(context.currentUser, context.language);
                const result = await cartEditService.removeItemFromCart(context.currentUser.uid, args.itemId);
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
        removeAddonFromCart: async (root, args, context) => {
            try {
                const cartEditService = new CartEditService(context.currentUser, context.language);
                const result = await cartEditService.removeAddonFromCart(context.currentUser.uid, args.itemId, args.addonId);
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

module.exports = resolvers;