const AdminFindService = require('../../service/admin/adminFindService');
const AdminEditService = require('../../service/admin/adminEditService');
const AdminCreateService = require('../../service/admin/adminCreateService');
const AdminRemoveService = require('../../service/admin/adminRemoveService');

const sharedResolvers = require('../sharedResolvers');
const TransactionService = require('../../service/transactionService');
const AdminWalletService = require('../../service/admin/adminWalletService');

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        findMeAdmin: async (parent, args, context) => {
            const adminFindService = new AdminFindService(context.currentUser, context.language);
            return await adminFindService.findAdminByAuthId(context.currentUser.uid);
        },
        findAdmin: async (parent, args, context) => {
            const adminFindService = new AdminFindService(context.currentUser, context.language);
            return await adminFindService.findAdminById(args.adminId);
        },
        listAdmins: async (parent, args, context) => {
            const adminFindService = new AdminFindService(context.currentUser, context.language);
            return await adminFindService.listAdminsNotRemoved(args.filter, args.pagination);
        },
        authStorageToken: async (parent, args, context) => {
            const adminFindService = new AdminFindService(context.currentUser, context.language);
            return await adminFindService.authStorageToken();
        },
        listInWalletTransactionsApp: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listAppInTransactions(args.filter, args.pagination);
        },
        listOutWalletTransactionsApp: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listAppOutTransactions(args.filter, args.pagination);
        },
        findAppWallet: async (parent, args, context) => {
            const adminWalletService = new AdminWalletService(context.currentUser, context.language);
            return await adminWalletService.getAppWallet();
        },
    },
    RootMutation: {
        createAdmin: async (root, args, context) => {
            try {
                const adminCreateService = new AdminCreateService(context.currentUser, context.language);
                const admin = await adminCreateService.createAdmin(args.adminInput);
                return {
                    status: true,
                    result: admin,
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
        editMeAdmin: async (root, args, context) => {
            try {
                const adminEditService = new AdminEditService(context.currentUser, context.language);
                const response = await adminEditService.editAdminByAuthId(context.currentUser.uid, args.adminUpdate);
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
        editAdmin: async (root, args, context) => {
            try {
                const adminEditService = new AdminEditService(context.currentUser, context.language);
                const response = await adminEditService.editAdminById(args.adminId, args.adminUpdate);
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
        setAdminsStatus: async (root, args, context) => {
            try {
                const adminEditService = new AdminEditService(context.currentUser, context.language);
                const response = await adminEditService.setAdminsStatus(args.adminsIds, args.status);
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
        resetAdminPassword: async (root, args, context) => {
            try {
                const adminEditService = new AdminEditService(context.currentUser, context.language);
                const address = await adminEditService.resetAdminPassword(args.adminId, args.password);
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
        resetMyPassword: async (root, args, context) => {
            try {
                const adminEditService = new AdminEditService(context.currentUser, context.language);
                const result = await adminEditService.resetMyPassword
                    (context.currentUser.uid, args.oldPassword, args.newPassword);
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
        removeMeAdmin: async (root, args, context) => {
            try {
                const adminRemoveService = new AdminRemoveService(context.currentUser, context.language);
                const result = await adminRemoveService.removeAdminByAuthId(context.currentUser.uid);
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
        removeAdmins: async (root, args, context) => {
            try {
                const adminRemoveService = new AdminRemoveService(context.currentUser, context.language);
                const result = await adminRemoveService.removeAdmins(args.adminsIds);
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
        rechargeAppWallet: async (root, args, context) => {
            try {
                const adminWalletService = new AdminWalletService(context.currentUser, context.language);
                const result = await adminWalletService.rechargeAppWallet(context.currentUser.uid, args.amount);
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
        withdrawFromAppWallet: async (root, args, context) => {
            try {
                const amount = args.amount;
                const transactionNo = args.transactionNo;

                const adminWalletService = new AdminWalletService(context.currentUser, context.language);
                const result = await adminWalletService.withdrawFromAppWallet(context.currentUser.uid, amount, transactionNo);
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