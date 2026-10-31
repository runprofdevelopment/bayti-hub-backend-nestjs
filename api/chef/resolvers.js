const ChefCreateService = require('../../service/chef/chefCreateService');
const ChefEditService = require('../../service/chef/chefEditService');
const ChefAuthService = require('../../service/chef/chefAuthService');
const ChefFindService = require('../../service/chef/chefFindService');
const ChefRemoveService = require('../../service/chef/chefRemoveService');
const ChefAddressService = require('../../service/chef/chefAddressService');
const ChefNotificationService = require('../../service/chef/chefNotificationService');
const ChefWalletService = require('../../service/chef/chefWalletService');
const ChefWalletListing = require('../../service/chef/chefWalletListing');
const ChefBankAccountService = require('../../service/chef/chefBankAccount');
const ChefRequestService = require('../../service/chef/chefRequestService');
const TransactionService = require('../../service/transactionService');
const ChefKitchenService = require('../../service/chef/chefKitchenService');
const ChefReviewService = require('../../service/chef/chefReviewService');
const ChefDashboardReviewService = require('../../service/chef/chefDashboardReviewService');
const PromotionCreateService = require('../../service/promotion/promotionCreateService');
const PromotionFindService = require('../../service/promotion/promotionFindService');

const sharedResolvers = require('../sharedResolvers');
const PromotionRemoveService = require('../../service/promotion/promotionRemoveService');

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listChefs: async (parent, args, context) => {
            const filter = args.filter;
            const pagination = args.pagination;
            const chefFindService = new ChefFindService(context.currentUser, context.language);
            return await chefFindService.listChefs(filter, pagination);
        },
        findMeChef: async (parent, args, context) => {
            const chefFindService = new ChefFindService(context.currentUser, context.language);
            return await chefFindService.findChefByAuthId(context.currentUser.uid);
        },
        findChefById: async (parent, args, context) => {
            const chefFindService = new ChefFindService(context.currentUser, context.language);
            return await chefFindService.findChefById(args.chefId);
        },
        myNotificationsChef: async (parent, args, context) => {
            const chefNotificationService = new ChefNotificationService(context.currentUser, context.language);
            return await chefNotificationService.listChefAndGeneralNotifications(context.currentUser.uid, args.pagination);
            // return await chefNotificationService.listChefNotificationsByAuthId(context.currentUser.uid, args.pagination);
        },
        listChefNotifications: async (parent, args, context) => {
            const chefNotificationService = new ChefNotificationService(context.currentUser, context.language);
            return await chefNotificationService.listChefNotificationsByChefId(args.chefId, args.notificationId);
        },
        findMyWalletChef: async (parent, args, context) => {
            const chefWalletService = new ChefWalletService(context.currentUser, context.language);
            return await chefWalletService.getWalletByAuthUid(context.currentUser.uid);
        },
        findChefWallet: async (parent, args, context) => {
            const chefWalletService = new ChefWalletService(context.user, context.currentUser, context.language)
            return await chefWalletService.getWalletByChefId(args.chefId);
        },
        bankAccountsChef: async (parent, args, context) => {
            const chefBankAccountService = new ChefBankAccountService(context.user, context.currentUser, context.language);
            return await chefBankAccountService.listChefBankAccountsByAuthId(context.currentUser.uid);
        },
        defaultBankAccountChef: async (parent, args, context) => {
            const chefBankAccountService = new ChefBankAccountService(context.user, context.currentUser, context.language);
            return await chefBankAccountService.getDefaultBankAccountByAuthId(context.currentUser.uid);
        },
        listChefBankAccounts: async (parent, args, context) => {
            const chefBankAccountService = new ChefBankAccountService(context.user, context.currentUser, context.language);
            return await chefBankAccountService.listChefBankAccountsById(args.chefId);
        },
        myInWalletTransactionsChef: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listChefInTransactionsByAuthId(context.currentUser.uid, args.pagination);
        },
        myOutWalletTransactionsChef: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listChefOutTransactionsByAuthId(context.currentUser.uid, args.pagination);
        },
        listInWalletTransactionsChef: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listChefInTransactionsByChefId(args.chefId, args.filter, args.pagination);
        },
        listOutWalletTransactionsChef: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listChefOutTransactionsByChefId(args.chefId, args.filter, args.pagination);
        },
        myChefRequests: async (parent, args, context) => {
            const chefRequestService = new ChefRequestService(context.currentUser, context.language);
            return await chefRequestService.getChefRequestsByAuthId(context.currentUser.uid, args.pagination);
        },
        listChefsRequests: async (parent, args, context) => {
            const chefRequestService = new ChefRequestService(context.currentUser, context.language);
            return await chefRequestService.listChefRequests(args.filter, args.pagination);
        },
        listMyReviewsChef: async (parent, args, context) => {
            const chefReviewService = new ChefReviewService(context.currentUser, context.language);
            return await chefReviewService.listChefReviewsByAuthId(context.currentUser.uid, args.filter, args.pagination);
        },
        listChefReviews: async (parent, args, context) => {
            const chefReviewService = new ChefReviewService(context.currentUser, context.language);
            return await chefReviewService.listChefReviewsById(args.chefId, args.filter, args.pagination);
        },
        myChefPromotions: async (parent, args, context) => {
            const promotionFindService = new PromotionFindService(context.currentUser, context.language);
            return await promotionFindService.listChefPromotionsByAuthId(context.currentUser.uid, args.filter, args.pagination);
        },
        listPromotions: async (parent, args, context) => {
            const promotionFindService = new PromotionFindService(context.currentUser, context.language);
            return await promotionFindService.listPromotions(args.filter, args.pagination);
        },
        listChefsWallets: async (parent, args, context) => {
            const chefWalletListing = new ChefWalletListing(context.currentUser, context.language);
            return await chefWalletListing.listWalletsGroup(args.filter, args.pagination);
            // const chefWalletService = new ChefWalletService(context.currentUser, context.language);
            // return await chefWalletService.listWallets(args.filter, args.pagination);
        },
    },
    RootMutation: {
        createMeChef: async (root, args, context) => {
            try {
                const chefCreateService = new ChefCreateService(context.currentUser, context.language);
                const chef = await chefCreateService.createChef(args.chefInput);
                return {
                    status: true,
                    result: chef,
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
        editMeChef: async (root, args, context) => {
            try {
                const chefEditService = new ChefEditService(context.currentUser, context.language);
                const response = await chefEditService.editChefByUid(context.currentUser.uid, args.chefUpdate);
                return {
                    status: true,
                    result: response,
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
        loginChef: async (root, args, context) => {
            try {
                const chefAuthService = new ChefAuthService(context.currentUser, context.language);
                const deviceToken = args.deviceToken;
                const response = await chefAuthService.login(context.currentUser.uid, deviceToken);
                return {
                    status: true,
                    result: response,
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
        logoutChef: async (root, args, context) => {
            try {
                const chefAuthService = new ChefAuthService(context.currentUser, context.language);
                const deviceToken = args.deviceToken;
                const response = await chefAuthService.logout(context.currentUser.uid, deviceToken);
                return {
                    status: true,
                    result: response,
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
        setChefAddress: async (root, args, context) => {
            try {
                const chefAddressService = new ChefAddressService(context.currentUser, context.language);
                const address = await chefAddressService.setChefAddress(context.currentUser.uid, args.address);
                return {
                    status: true,
                    result: address,
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
        setChefsStatus: async (root, args, context) => {
            try {
                const chefIds = args.chefsIds
                const status = args.status
                const chefEditService = new ChefEditService(context.currentUser, context.language)
                const result = await chefEditService.setChefsStatus(chefIds, status)
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
        removeMeChef: async (root, args, context) => {
            try {
                const chefRemoveService = new ChefRemoveService(context.currentUser, context.language)
                const result = await chefRemoveService.removeChefByAuthId(context.currentUser.uid);
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
        removeChefs: async (root, args, context) => {
            try {
                const chefRemoveService = new ChefRemoveService(context.currentUser, context.language)
                const result = await chefRemoveService.removeChefs(args.chefsIds)
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
        readNotificationChef: async (parent, args, context) => {
            try {
                const chefNotificationService = new ChefNotificationService(context.currentUser, context.language);
                const result = await chefNotificationService.readNotification(context.currentUser.uid, args.notificationId);
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
        removeNotificationChef: async (parent, args, context) => {
            try {
                const chefNotificationService = new ChefNotificationService(context.currentUser, context.language)
                const result = await chefNotificationService.removeNotification(context.currentUser.uid, args.notificationId)
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
        addBankAccountChef: async (parent, args, context) => {
            try {
                const chefBankAccountService = new ChefBankAccountService(context.currentUser, context.language)
                const result = await chefBankAccountService.addBankAccount(context.currentUser.uid, args.bankAccount)
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
        removeBankAccountChef: async (parent, args, context) => {
            try {
                const chefBankAccountService = new ChefBankAccountService(context.currentUser, context.language)
                const result = await chefBankAccountService.removeBankAccount(context.currentUser.uid, args.bankAccountId)
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
        editBankAccountChef: async (parent, args, context) => {
            try {
                const chefBankAccountService = new ChefBankAccountService(context.currentUser, context.language)
                const result = await chefBankAccountService.editBankAccount(context.currentUser.uid, args.bankAccountId, args.bankAccountUpdate)
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
        setDefaultBankAccountChef: async (parent, args, context) => {
            try {
                const chefBankAccountService = new ChefBankAccountService(context.currentUser, context.language)
                const result = await chefBankAccountService.setDefaultBankAccount(context.currentUser.uid, args.bankAccountId)
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
        rechargeChefWallet: async (parent, args, context) => {
            try {
                const chefWalletService = new ChefWalletService(context.currentUser, context.language);
                const result = await chefWalletService.rechargeWalletForChefByAuthId(context.currentUser.uid, args.amount);
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
        addWithdrawRequestChef: async (parent, args, context) => {
            try {
                const chefRequestService = new ChefRequestService(context.currentUser, context.language);
                const result = await chefRequestService.addWithdrawRequest(context.currentUser.uid, args.requestInput);
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
        setMyKitchen: async (parent, args, context) => {
            try {
                const chefKitchenService = new ChefKitchenService(context.currentUser, context.language);
                const result = await chefKitchenService.setChefKitchenByAuth(context.currentUser.uid, args.kitchenInput);
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
        setKitchen: async (parent, args, context) => {
            try {
                const chefKitchenService = new ChefKitchenService(context.currentUser, context.language);
                const result = await chefKitchenService.setChefKitchenByChefId(args.chefId, args.kitchenInput);
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
        setMySections: async (parent, args, context) => {
            try {
                const chefKitchenService = new ChefKitchenService(context.currentUser, context.language);
                const result = await chefKitchenService.setSectionsByAuthId(context.currentUser.uid, args.sections);
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
        setKitchenSections: async (parent, args, context) => {
            try {
                const chefKitchenService = new ChefKitchenService(context.currentUser, context.language);
                const result = await chefKitchenService.setSectionsByChefId(args.chefId, args.sections);
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
        decideWithdrawRequestChef: async (parent, args, context) => {
            try {
                const chefRequestService = new ChefRequestService(context.currentUser, context.language);
                const result = await chefRequestService.decideWithdrawRequest(args.requestId, args.acceptRequest, args.transactionTimeStamp, args.notes);
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
        confirmWithdrawRequestChef: async (parent, args, context) => {
            try {
                const chefRequestService = new ChefRequestService(context.currentUser, context.language);
                const result = await chefRequestService.confirmWithdrawRequest(args.requestId, args.transactionId, args.transactionUrl);
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
        promotoHome: async (parent, args, context) => {
            try {
                const promotionCreateService = new PromotionCreateService(context.currentUser, context.language);
                const result = await promotionCreateService.promotChef(context.currentUser.uid, args.promotionInput);
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
        removePromotion: async (parent, args, context) => {
            try {
                const promotionId = args.promotionId;
                const promotionRemoveService = new PromotionRemoveService(context.currentUser, context.language);
                const result = await promotionRemoveService.removePromotion(promotionId);
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
        rechargeChefWalletByAdmin: async (parent, args, context) => {
            try {
                const chefId = args.chefId;
                const amount = args.amount;
                const notes = args.notes;

                const chefWalletService = new ChefWalletService(context.currentUser, context.language);
                const result = await chefWalletService.rechargeChefWalletByAdmin(chefId, amount, notes);
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
        setChefDashboardReview: async (parent, args, context) => {
            try {
                const chefId = args.chefId
                const reviewInput = args.reviewInput

                const chefDashboardReviewService = new ChefDashboardReviewService(context.currentUser, context.language);
                const result = await chefDashboardReviewService.setChefReview(chefId, reviewInput);
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