const CaptainCreateService = require('../../service/captain/captainCreateService');
const CaptainEditService = require('../../service/captain/captainEditService');
const CaptainAuthService = require('../../service/captain/captainAuthService');
const CaptainFindService = require('../../service/captain/captainFindService');
const CaptainRemoveService = require('../../service/captain/captainRemoveService');
const CaptainNotificationService = require('../../service/captain/captainNotificationService');
const CaptainWalletService = require('../../service/captain/captainWalletService');
const CaptainWalletListing = require('../../service/captain/captainWalletListing');
const CaptainBankAccountService = require('../../service/captain/captainBankAccount');
const CaptainRequestService = require('../../service/captain/captainRequestService');
const CaptainDashboardReviewService = require('../../service/captain/captainDashboardReviewService');
const TransactionService = require('../../service/transactionService');

const sharedResolvers = require('../sharedResolvers');

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listCaptains: async (parent, args, context) => {
            const filter = args.filter;
            const pagination = args.pagination;
            const captainFindService = new CaptainFindService(context.currentUser, context.language);
            return await captainFindService.listCaptains(filter, pagination);
        },
        findMeCaptain: async (parent, args, context) => {
            const captainFindService = new CaptainFindService(context.currentUser, context.language);
            return await captainFindService.findCaptainByAuthId(context.currentUser.uid);
        },
        findCaptainById: async (parent, args, context) => {
            const captainFindService = new CaptainFindService(context.currentUser, context.language);
            return await captainFindService.findCaptainById(args.captainId);
        },
        myNotificationsCaptain: async (parent, args, context) => {
            const captainNotificationService = new CaptainNotificationService(context.currentUser, context.language);
            return await captainNotificationService.listCaptainAndGeneralNotifications(context.currentUser.uid, args.pagination);
            // return await captainNotificationService.listCaptainsNotificationsByAuthId(context.currentUser.uid, args.pagination);
        },
        findMyWalletCaptain: async (parent, args, context) => {
            const captainWalletService = new CaptainWalletService(context.currentUser, context.language);
            return await captainWalletService.getWalletByAuthId(context.currentUser.uid);
        },
        findCaptainWallet: async (parent, args, context) => {
            const captainWalletService = new CaptainWalletService(context.currentUser, context.language);
            return await captainWalletService.getWalletByCaptainId(args.captainId);
        },
        bankAccountsCaptain: async (parent, args, context) => {
            const captainBankAccountService = new CaptainBankAccountService(context.currentUser, context.language);
            return await captainBankAccountService.listCaptainBankAccountsByAuthId(context.currentUser.uid);
        },
        defaultBankAccountCaptain: async (parent, args, context) => {
            const captainBankAccountService = new CaptainBankAccountService(context.currentUser, context.language);
            return await captainBankAccountService.getDefaultBankAccountByAuthId(context.currentUser.uid);
        },
        listCaptainBankAccounts: async (parent, args, context) => {
            const captainBankAccountService = new CaptainBankAccountService(context.currentUser, context.language);
            return await captainBankAccountService.listCaptainBankAccountsById(args.captainId);
        },
        myInWalletTransactionsCaptain: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listCaptainInTransactionsByAuthId(context.currentUser.uid, args.pagination);
        },
        myOutWalletTransactionsCaptain: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listCaptainOutTransactionsByAuthId(context.currentUser.uid, args.pagination);
        },
        listInWalletTransactionsCaptain: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listCaptainInTransactionsByCaptainId(args.captainId, args.filter, args.pagination);
        },
        listOutWalletTransactionsCaptain: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listCaptainOutTransactionsByCaptainId(args.captainId, args.filter, args.pagination);
        },
        myCaptainRequests: async (parent, args, context) => {
            const captainRequestService = new CaptainRequestService(context.currentUser, context.language);
            return await captainRequestService.getCaptainRequestsByAuthId(context.currentUser.uid, args.pagination);
        },
        listCaptainsRequests: async (parent, args, context) => {
            const captainRequestService = new CaptainRequestService(context.currentUser, context.language);
            return await captainRequestService.listCaptainRequests(args.filter, args.pagination);
        },
        listCaptainsWallets: async (parent, args, context) => {
            const captainWalletListing = new CaptainWalletListing(context.currentUser, context.language);
            return await captainWalletListing.listWalletsGroup(args.filter, args.pagination);
            // const captainWalletService = new CaptainWalletService(context.currentUser, context.language);
            // return await captainWalletService.listWallets(args.filter, args.pagination);
        },
    },
    RootMutation: {
        createMeCaptain: async (root, args, context) => {
            try {
                const captainCreateService = new CaptainCreateService(context.currentUser, context.language);
                const captain = await captainCreateService.createCaptain(args.captainInput);
                return {
                    status: true,
                    result: captain,
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
        editMeCaptain: async (root, args, context) => {
            try {
                const captainEditService = new CaptainEditService(context.currentUser, context.language);
                const response = await captainEditService.editCaptainByUid(context.currentUser.uid, args.captainUpdate);
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
        loginCaptain: async (root, args, context) => {
            try {
                const captainAuthService = new CaptainAuthService(context.currentUser, context.language);
                const deviceToken = args.deviceToken;
                const response = await captainAuthService.login(context.currentUser.uid, deviceToken);
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
        logoutCaptain: async (root, args, context) => {
            try {
                const captainAuthService = new CaptainAuthService(context.currentUser, context.language);
                const deviceToken = args.deviceToken;
                const response = await captainAuthService.logout(context.currentUser.uid, deviceToken);
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
        setNotificationStatusCaptain: async (root, args, context) => {
            try {
                const notificationStatus = args.notificationStatus;
                const captainEditService = new CaptainEditService(context.currentUser, context.language);
                const result = await captainEditService.setNotificationStatusByUid(context.currentUser.uid, notificationStatus);
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
        setCaptainsStatus: async (root, args, context) => {
            try {
                const captainsIds = args.captainsIds;
                const status = args.status;
                const captainEditService = new CaptainEditService(context.currentUser, context.language);
                const result = await captainEditService.setCaptainsStatus(captainsIds, status);
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
        removeMeCaptain: async (root, args, context) => {
            try {
                const captainRemoveService = new CaptainRemoveService(context.currentUser, context.language);
                const result = await captainRemoveService.removeCaptainByAuthId(context.currentUser.uid);
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
        removeCaptains: async (root, args, context) => {
            try {
                const captainRemoveService = new CaptainRemoveService(context.currentUser, context.language);
                const result = await captainRemoveService.removeCaptains(args.captainsIds);
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
        readNotificationCaptain: async (parent, args, context) => {
            try {
                const captainNotificationService = new CaptainNotificationService(context.currentUser, context.language);
                const result = await captainNotificationService.readNotification(context.currentUser.uid, args.notificationId);
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
        removeNotificationCaptain: async (parent, args, context) => {
            try {
                const captainNotificationService = new CaptainNotificationService(context.currentUser, context.language);
                const result = await captainNotificationService.removeNotification(context.currentUser.uid, args.notificationId);
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
        addBankAccountCaptain: async (parent, args, context) => {
            try {
                const captainBankAccountService = new CaptainBankAccountService(context.currentUser, context.language);
                const result = await captainBankAccountService.addBankAccount(context.currentUser.uid, args.bankAccount);
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
        removeBankAccountCaptain: async (parent, args, context) => {
            try {
                const captainBankAccountService = new CaptainBankAccountService(context.currentUser, context.language);
                const result = await captainBankAccountService.removeBankAccount(context.currentUser.uid, args.bankAccountId);
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
        editBankAccountCaptain: async (parent, args, context) => {
            try {
                const captainBankAccountService = new CaptainBankAccountService(context.currentUser, context.language);
                const result = await captainBankAccountService.editBankAccount(context.currentUser.uid, args.bankAccountId, args.bankAccountUpdate);
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
        setDefaultBankAccountCaptain: async (parent, args, context) => {
            try {
                const captainBankAccountService = new CaptainBankAccountService(context.currentUser, context.language);
                const result = await captainBankAccountService.setDefaultBankAccountByAuthId(context.currentUser.uid, args.bankAccountId);
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
        rechargeCaptainWallet: async (parent, args, context) => {
            try {
                const captainWalletService = new CaptainWalletService(context.currentUser, context.language);
                const result = await captainWalletService.rechargeWalletForCaptianByAuthId(context.currentUser.uid, args.amount);
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
        addWithdrawRequestCaptain: async (parent, args, context) => {
            try {
                const captainRequestService = new CaptainRequestService(context.currentUser, context.language);
                const result = await captainRequestService.addWithdrawRequest(context.currentUser.uid, args.requestInput);
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
        setCurrentLocation: async (parent, args, context) => {
            try {
                const captainEditService = new CaptainEditService(context.currentUser, context.language);
                const result = await captainEditService.setCurrentLocationByAuthId(context.currentUser.uid, args.lat, args.lng);
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
        decideWithdrawRequestCaptain: async (parent, args, context) => {
            try {
                const captainRequestService = new CaptainRequestService(context.currentUser, context.language);
                const result = await captainRequestService.decideWithdrawRequest(args.requestId, args.acceptRequest, args.transactionTimeStamp, args.notes);
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
        confirmWithdrawRequestCaptain: async (parent, args, context) => {
            try {
                const captainRequestService = new CaptainRequestService(context.currentUser, context.language);
                const result = await captainRequestService.confirmWithdrawRequest(args.requestId, args.transactionId, args.transactionUrl);
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
        rechargeCaptainWalletByAdmin: async (parent, args, context) => {
            try {
                const captainId = args.captainId;
                const amount = args.amount;
                const notes = args.notes;

                const captainWalletService = new CaptainWalletService(context.currentUser, context.language);
                const result = await captainWalletService.rechargeCaptainWalletByAdmin(captainId, amount, notes);
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
        setCaptainDashboardReview: async (parent, args, context) => {
            try {
                const captainId = args.captainId
                const reviewInput = args.reviewInput

                const captainDashboardReviewService = new CaptainDashboardReviewService(context.currentUser, context.language);
                const result = await captainDashboardReviewService.setCaptainReview(captainId, reviewInput);
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