const admin = require('firebase-admin');
const CollectionRepository = require('../../database/collectionRepository');
const ChefBankAccountService = require('./chefBankAccount');
const ChefWalletService = require('./chefWalletService');
const CustomError = require('../../error/customeError');
const ChefRepository = require('../../database/chefRepository');
const ChefNotificationService = require('./chefNotificationService');
const TransactionService = require('../transactionService');
const BadgeService = require('../badgeService');
const ChefFindService = require('./chefFindService');
const { i18n } = require('../../i18n');

module.exports = class ChefRequestService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.requestRepository = new CollectionRepository('requests');
        this.chefNotificationService = new ChefNotificationService(this.currentUser, this.language);
        this.chefBankAccountService = new ChefBankAccountService(this.currentUser, this.language);
        this.chefWalletService = new ChefWalletService(this.currentUser, this.language);
        this.transactionService = new TransactionService(this.currentUser, this.language);
        this.chefRepository = new ChefRepository();
        this.badgeService = new BadgeService(this.currentUser, this.language);
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
    }

    async addWithdrawRequest(authId, data) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const bankAccountId = data.bankAccountId;

            const bankAccount = await this.chefBankAccountService.getChefBankAccountById(chef.id, bankAccountId);
            if (!bankAccount) {
                throw new CustomError(this.language, 'chef.error.bankAccountNotFound');
            }

            const wallet = await this.chefWalletService.getWalletByAuthUid(authId);
            // Reduce amount from the wallet
            await this.chefWalletService.addAmountToWallet(chef.id, 0, -data.amount);

            const request = {
                ...data,
                id: admin.firestore().collection(`ids`)
                    .doc().id,
                userType: 'chef',
                ownerId: chef.id,
                bankAccount,
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: chef.id,
                updatedBy: chef.id
            }

            // Decrement chef requests badge
            await this.badgeService.incrementBadge("chefRequests");

            await this.requestRepository.setDocument(request);

            return request;
        } catch (error) {
            throw error;
        }
    }

    async getChefRequestsById(chefId, pagination) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            return await this.getChefRequests(chef, pagination);
        } catch (error) {
            throw error;
        }
    }

    async getChefRequestsByAuthId(authId, pagination) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.getChefRequests(chef, pagination);
        } catch (error) {
            throw error;
        }
    }

    async getChefRequests(chef, pagination) {
        try {
            const filter = [
                { key: 'ownerId', value: chef.id, operator: '==' },
                { key: 'userType', value: 'chef', operator: '==' }
            ]

            return await this.requestRepository.listDocuments(filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async decideWithdrawRequest(requestId, acceptRequest, transactionTimeStamp, notes) {
        try {
            const request = await this.requestRepository.findDocumentById(requestId);
            if (!request) {
                throw new CustomError(this.language, 'request.error.requestNotFound');
            }
            const chef = await this.chefFindService.findChefById(request.ownerId);

            if (request.status !== 'pending') {
                throw new CustomError(this.language, 'request.error.cannotDecideRequest');
            }
            if (acceptRequest) {
                if (!transactionTimeStamp) {
                    throw new CustomError(this.language, 'request.error.missedTimeStamp');
                }
                await this.chefNotificationService.notifyChef(chef.id, {
                    en: i18n('en', 'request.notification.withdrawAcceptTitle'),
                    ar: i18n('ar', 'request.notification.withdrawAcceptTitle')
                }, {
                    en: i18n('en', 'request.notification.withdrawAcceptBody'),
                    ar: i18n('ar', 'request.notification.withdrawAcceptBody'),
                }, {
                    key: 'withdrawAccept',
                    value: `${requestId}`
                });
                return await this.requestRepository.editDocument(requestId, {
                    status: 'accepted',
                    transactionTimeStamp,
                    notes
                });

            } else {
                await this.chefWalletService.addAmountToWallet(request.ownerId, 0, request.amount);

                await this.chefNotificationService.notifyChef(chef.id, {
                    en: i18n('en', 'request.notification.withdrawRejectTitle'),
                    ar: i18n('ar', 'request.notification.withdrawRejectTitle')
                }, {
                    en: i18n('en', 'request.notification.withdrawRejectBody'),
                    ar: i18n('ar', 'request.notification.withdrawRejectBody'),
                }, {
                    key: 'withdrawReject',
                    value: `${requestId}`
                });

                // Decrement chef requests badge
                await this.badgeService.decrementBadge("chefRequests");

                return await this.requestRepository.editDocument(requestId, {
                    status: 'rejected',
                    notes
                })
            }
        } catch (error) {
            throw error;
        }
    }

    async confirmWithdrawRequest(requestId, transactionId, transactionUrl) {
        try {
            const request = await this.requestRepository.findDocumentById(requestId);
            if (!request) {
                throw new CustomError(this.language, 'request.error.requestNotFound');
            }
            const chef = await this.chefFindService.findChefById(request.ownerId);

            if (request.status !== 'accepted') {
                throw new CustomError(this.language, 'request.error.cannotDecideRequest');
            }

            await this.chefWalletService.addAmountToWallet(request.ownerId, -request.amount, 0);

            const transaction = await this.transactionService.createTransaction({
                id: admin.firestore().collection(`ids`)
                    .doc().id,
                type: 'withdraw',
                amount: request.amount,
                objectType: 'request',
                objectId: request.id,
                payerType: 'admin',
                payerId: "-1",
                payeeType: "chef",
                payeeId: chef.id,
                status: 'success',
                paymentMethod: 'wallet',
                paymentId: transactionId,
                createdBy: this.currentUser.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            await this.chefNotificationService.notifyChef(chef.id, {
                en: i18n('en', 'request.notification.withdrawConfirmTitle'),
                ar: i18n('ar', 'request.notification.withdrawConfirmTitle')
            }, {
                en: i18n('en', 'request.notification.withdrawConfirmBody'),
                ar: i18n('ar', 'request.notification.withdrawConfirmBody'),
            }, {
                key: 'withdrawConfirm',
                value: `${requestId}`
            });

            // Decrement chef requests badge
            await this.badgeService.decrementBadge("chefRequests");

            return await this.requestRepository.editDocument
                (requestId, { status: 'confirmed', transactionId, transactionUrl });
        } catch (error) {
            throw error;
        }
    }

    async listChefRequests(filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: "userType", operator: "==", value: "chef" }
            ]
            const requests = await this.requestRepository.listDocuments(appendedFilter, pagination);
            for (const request of requests) {
                const chef = await this.chefFindService.findChefById(request.ownerId);
                request.chef = chef;
            }

            return requests;
        } catch (error) {
            throw error;
        }
    }
}