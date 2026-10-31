const ClientCreateService = require('../../service/client/clientCreateService');
const ClientEditService = require('../../service/client/clientEditService');
const ClientAuthService = require('../../service/client/clientAuthService');
const ClientFindService = require('../../service/client/clientFindService');
const ClientRemoveService = require('../../service/client/clientRemoveService');
const ClientAddressService = require('../../service/client/clientAddressService');
const ClientNotificationService = require('../../service/client/clientNotificationService');
const ClientWalletService = require('../../service/client/clientWalletService');
const ClientWalletListing = require('../../service/client/clientWalletListing');
const TransactionService = require('../../service/transactionService');
const ClientFavouriteService = require('../../service/client/clientFavouriteService');

const sharedResolvers = require('../sharedResolvers');
const ClientDashboardReviewService = require('../../service/client/clientDashboardReviewService');

const resolvers = {
    ...sharedResolvers,
    RootQuery: {
        listClients: async (parent, args, context) => {
            const filter = args.filter;
            const pagination = args.pagination;
            const clientFindService = new ClientFindService(context.currentUser, context.language);
            return await clientFindService.listClients(filter, pagination);
        },
        findMeClient: async (parent, args, context) => {
            const clientFindService = new ClientFindService(context.currentUser, context.language);
            return await clientFindService.findClientByAuthId(context.currentUser.uid);
        },
        findClientById: async (parent, args, context) => {
            const clientFindService = new ClientFindService(context.currentUser, context.language);
            return await clientFindService.findClientById(args.clientId);
        },
        myAddressesClient: async (parent, args, context) => {
            const clientAddressService = new ClientAddressService(context.currentUser, context.language);
            return await clientAddressService.listClientAddressesByAuthId(context.currentUser.uid);
        },
        myDefaultAddressClient: async (parent, args, context) => {
            const clientAddressService = new ClientAddressService(context.currentUser, context.language);
            return await clientAddressService.getDefaultAddressOfClientByAuthId(context.currentUser.uid);
        },
        listClientAddresses: async (parent, args, context) => {
            const clientAddressService = new ClientAddressService(context.currentUser, context.language);
            return await clientAddressService.listClientAddressesById(args.clientId);
        },
        myNotificationsClient: async (parent, args, context) => {
            const clientNotificationService = new ClientNotificationService(context.currentUser, context.language);
            return await clientNotificationService.listClientAndGeneralNotifications(context.currentUser.uid, args.pagination);
            // return await clientNotificationService.listClientNotifications(context.currentUser.uid, args.pagination);
        },
        findNotificationClient: async (parent, args, context) => {
            const clientNotificationService = new ClientNotificationService(context.currentUser, context.language);
            return await clientNotificationService.findNotificationById(context.currentUser.uid, args.notificationId);
        },
        findMyWalletClient: async (parent, args, context) => {
            const clientWalletService = new ClientWalletService(context.currentUser, context.language);
            return await clientWalletService.getWalletByAuthId(context.currentUser.uid);
        },
        findClientWallet: async (parent, args, context) => {
            const clientWalletService = new ClientWalletService(context.currentUser, context.language);
            return await clientWalletService.getWalletByClientId(args.clientId);
        },
        myInWalletTransactionsClient: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listClientInTransactionsByAuthId(context.currentUser.uid, args.pagination);
        },
        myOutWalletTransactionsClient: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listClientOutTransactionsByAuthId(context.currentUser.uid, args.pagination);
        },
        listInWalletTransactionsClient: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listClientInTransactionsById(args.clientId, args.filter, args.pagination);
        },
        listOutWalletTransactionsClient: async (parent, args, context) => {
            const transactionService = new TransactionService(context.currentUser, context.language);
            return await transactionService.listClientOutTransactionsById(args.clientId, args.filter, args.pagination);
        },
        myFavouriteChefs: async (parent, args, context) => {
            const clientFavouriteService = new ClientFavouriteService(context.currentUser, context.language);
            return await clientFavouriteService.listFavouriteChefs(context.currentUser.uid);
        },
        myFavouriteChefsIds: async (parent, args, context) => {
            const clientFavouriteService = new ClientFavouriteService(context.currentUser, context.language);
            return await clientFavouriteService.listFavouriteChefIds(context.currentUser.uid);
        },
        listClientsWallets: async (parent, args, context) => {
            const clientWalletListing = new ClientWalletListing(context.currentUser, context.language);
            return await clientWalletListing.listWalletsGroup(args.filter, args.pagination);
            // return await clientWalletService.listWallets(args.filter, args.pagination);
        },
    },
    RootMutation: {
        fixAddresses: async (parent, args, context) => {
            // const admin = require('firebase-admin');
            // const collection = await admin.firestore().collectionGroup('addresses').get()
            // collection.forEach(doc => {
            //     doc.ref.update({
            //         createdAt: admin.firestore.FieldValue.serverTimestamp(),
            //         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            //     })
            // });

            return true
        },
        createMeClient: async (root, args, context) => {
            try {
                const clientCreateService = new ClientCreateService(context.currentUser, context.language);
                const user = await clientCreateService.createClient(args.clientInput);
                return {
                    status: true,
                    result: user,
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
        editMeClient: async (root, args, context) => {
            try {
                const clientEditService = new ClientEditService(context.currentUser, context.language);
                const response = await clientEditService.editClientByAuthId(context.currentUser.uid, args.clientUpdate);
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
        login: async (root, args, context) => {
            try {
                const clientAuthService = new ClientAuthService(context.currentUser, context.language);
                const deviceToken = args.deviceToken;
                const response = await clientAuthService.login(context.currentUser.uid, deviceToken);
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
        logout: async (root, args, context) => {
            try {
                const clientAuthService = new ClientAuthService(context.currentUser, context.language);
                const deviceToken = args.deviceToken;
                const response = await clientAuthService.logout(context.currentUser.uid, deviceToken);
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
        addAddress: async (root, args, context) => {
            try {
                const clientAddressService = new ClientAddressService(context.currentUser, context.language);
                const address = await clientAddressService.addAddressForClient(context.currentUser.uid, args.address);
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
        removeAddress: async (root, args, context) => {
            try {
                const clientAddressService = new ClientAddressService(context.currentUser, context.language);
                const result = await clientAddressService.removeAddressOfClient(context.currentUser.uid, args.addressId);
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
        editAddress: async (root, args, context) => {
            try {
                const addressId = args.addressId;
                const addressUpdate = args.addressUpdate;
                const clientAddressService = new ClientAddressService(context.currentUser, context.language);
                const result = await clientAddressService.editAddressForClient
                    (context.currentUser.uid, addressId, addressUpdate);
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
        setDefaultAddress: async (root, args, context) => {
            try {
                const clientAddressService = new ClientAddressService(context.currentUser, context.language);
                const result = await clientAddressService.setDefaultAddressForClientByAuthId(context.currentUser.uid, args.addressId);
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
        setNotificationStatus: async (root, args, context) => {
            try {
                const notificationStatus = args.notificationStatus;
                const clientEditService = new ClientEditService(context.currentUser, context.language);
                const result = await clientEditService.setNotificationStatusByUid(context.currentUser.uid, notificationStatus);
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
        setClientsStatus: async (root, args, context) => {
            try {
                const clientIds = args.clientsIds
                const status = args.status
                const clientEditService = new ClientEditService(context.currentUser, context.language);
                const result = await clientEditService.setClientsStatus(clientIds, status);
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
        removeMeClient: async (root, args, context) => {
            try {
                const clientRemoveService = new ClientRemoveService(context.currentUser, context.language);
                const result = await clientRemoveService.removeClientByAuthId(context.currentUser.uid);
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
        removeClients: async (root, args, context) => {
            try {
                const clientRemoveService = new ClientRemoveService(context.currentUser, context.language)
                const result = await clientRemoveService.removeClients(args.clientsIds);
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
        }, readNotificationClient: async (parent, args, context) => {
            try {
                const clientNotificationService = new ClientNotificationService(context.currentUser, context.language);
                const result = await clientNotificationService.readNotification(context.currentUser.uid, args.notificationId);
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
        removeNotificationClient: async (parent, args, context) => {
            try {
                const clientNotificationService = new ClientNotificationService(context.currentUser, context.language);
                const result = await clientNotificationService.removeNotification(context.currentUser.uid, args.notificationId);
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
        rechargeClientWallet: async (parent, args, context) => {
            try {
                const clientWalletService = new ClientWalletService(context.currentUser, context.language);
                const result = await clientWalletService.rechargeWalletForAuthId(context.currentUser.uid, args.amount);
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
        addChefToFavourites: async (parent, args, context) => {
            try {
                const clientFavouriteService = new ClientFavouriteService(context.currentUser, context.language);
                const result = await clientFavouriteService.addChefToFavourites(context.currentUser.uid, args.chefId);
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
        removeChefFromFavourites: async (parent, args, context) => {
            try {
                const clientFavouriteService = new ClientFavouriteService(context.currentUser, context.language);
                const result = await clientFavouriteService.removeChefFromFavourites(context.currentUser.uid, args.chefId);
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
        rechargeClientWalletByAdmin: async (parent, args, context) => {
            try {
                const clientID = args.clientId
                const amount = args.amount
                const notes = args.notes;

                const clientWalletService = new ClientWalletService(context.currentUser, context.language);
                const result = await clientWalletService.rechargeClientWalletByAdmin(clientID, amount, notes);
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
        setClientDashboardReview: async (parent, args, context) => {
            try {
                const clientId = args.clientId
                const reviewInput = args.reviewInput

                const clientDashboardReviewService = new ClientDashboardReviewService(context.currentUser, context.language);
                const result = await clientDashboardReviewService.setClientReview(clientId, reviewInput);
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