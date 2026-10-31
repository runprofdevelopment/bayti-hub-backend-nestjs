const CheckoutService = require('../../service/order/checkoutService');
const OrderFindService = require('../../service/order/orderFindService');
const OrderCaptainService = require('../../service/order/orderCaptainService');
const OrderCancelService = require('../../service/order/orderCancelService');
const OrderCloseService = require('../../service/order/orderCloseService');
const OrderReviewService = require('../../service/order/orderReviewService');
const sharedResolvers = require('../sharedResolvers');

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listOrders: async (parent, args, context) => {
            const orderFindService = new OrderFindService(context.currentUser, context.language);
            return await orderFindService.listOrders(args.filter, args.pagination);
        },
        myClientOrders: async (parent, args, context) => {
            const orderFindService = new OrderFindService(context.currentUser, context.language);
            return await orderFindService.listClientOrdersByAuthId(context.currentUser.uid, args.filter, args.pagination);
        },
        myChefOrders: async (parent, args, context) => {
            const orderFindService = new OrderFindService(context.currentUser, context.language);
            return await orderFindService.listChefOrdersByAuthId(context.currentUser.uid, args.filter, args.pagination);
        },
        myCaptainOrders: async (parent, args, context) => {
            const orderFindService = new OrderFindService(context.currentUser, context.language);
            return await orderFindService.listCaptainOrdersByAuthId(context.currentUser.uid, args.filter, args.pagination);
        },
        findOrderById: async (parent, args, context) => {
            const orderFindService = new OrderFindService(context.currentUser, context.language);
            return await orderFindService.findOrderById(args.orderId);
        },
        listCaptainsInOrderArea: async (parent, args, context) => {
            const orderCaptainService = new OrderCaptainService(context.currentUser, context.language);
            return await orderCaptainService.listCaptainsInOrderArea(args.orderId);
        },
    },
    RootMutation: {
        checkout: async (root, args, context) => {
            try {
                const orderInput = args.orderInput

                const checkoutService = new CheckoutService(context.currentUser, context.language);
                const result = await checkoutService.checkout(context.currentUser.uid, orderInput);
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
        decideOrderDelivery: async (root, args, context) => {
            try {
                const orderCaptainService = new OrderCaptainService(context.currentUser, context.language);
                const result = await orderCaptainService.decideOrderDelivery(context.currentUser.uid, args.orderId, args.decision);
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
        cancelOrder: async (root, args, context) => {
            try {
                const orderCancelService = new OrderCancelService(context.currentUser, context.language);
                const result = await orderCancelService.cancelOrder(args.orderId, args.notes);
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
        closeOrder: async (root, args, context) => {
            try {
                const orderCloseService = new OrderCloseService(context.currentUser, context.language);
                const result = await orderCloseService.closeOrderWithDeliveringState(args.orderId);
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
        closeOrdeAdmin: async (root, args, context) => {
            try {
                const orderCloseService = new OrderCloseService(context.currentUser, context.language);
                const result = await orderCloseService.closeOrderWithInProgressState(args.orderId);
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
        reviewChef: async (root, args, context) => {
            try {
                const orderReviewService = new OrderReviewService(context.currentUser, context.language);
                const result = await orderReviewService.reviewChef(args.orderId, args.review);
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
        assignOrderToCaptain: async (root, args, context) => {
            try {
                const orderCaptainService = new OrderCaptainService(context.currentUser, context.language);
                const result = await orderCaptainService.assignOrderToCaptainByIds(args.orderId, args.captainId);
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
        cancelAssignOrderToCaptain: async (root, args, context) => {
            try {
                const orderCaptainService = new OrderCaptainService(context.currentUser, context.language);
                const result = await orderCaptainService.cancelAssignOrderToCaptain(args.orderId, args.captainId);
                
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
        handOrderToCaptain: async (root, args, context) => {
            try {
                const orderCaptainService = new OrderCaptainService(context.currentUser, context.language);
                const result = await orderCaptainService.handOrderToCaptain(context.currentUser.uid, args.orderId, args.QRCode);
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
        skipReview: async (root, args, context) => {
            try {
                const orderReviewService = new OrderReviewService(context.currentUser, context.language);
                const result = await orderReviewService.skipReview(args.orderId);
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