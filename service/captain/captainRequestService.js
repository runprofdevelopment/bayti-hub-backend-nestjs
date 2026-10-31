const admin = require('firebase-admin');
const CaptainBankAccountService = require('./captainBankAccount');
const CaptainWalletService = require('./captainWalletService');
const CustomError = require('../../error/customeError');
const CaptainRepository = require('../../database/captainRepository');
const CaptainFindService = require('./captainFindService');
const CaptainNotificationService = require('./captainNotificationService');
const TransactionService = require('../transactionService');
const BadgeService = require('../badgeService');
const CollectionRepository = require('../../database/collectionRepository');
const { i18n } = require('../../i18n');

module.exports = class CaptainRequestService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.requestRepository = new CollectionRepository('requests');
        this.captainNotificationService = new CaptainNotificationService(this.currentUser, this.language);
        this.captainBankAccountService = new CaptainBankAccountService(this.currentUser, this.language);
        this.captainWalletService = new CaptainWalletService(this.currentUser, this.language);
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
        this.transactionService = new TransactionService(this.currentUser, this.language);
        this.captainRepository = new CaptainRepository();
        this.badgeService = new BadgeService(this.currentUser, this.language);
    }

    async addWithdrawRequest(authId, data) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            const bankAccountId = data.bankAccountId;
            const bankAccount = await this.captainBankAccountService.getCaptainBankAccountBydId(captain.id, bankAccountId);
            if (!bankAccount) {
                throw new CustomError(this.language, 'captain.error.bankAccountNotFound');
            }
            const wallet = await this.captainWalletService.getWalletByCaptainId(captain.id);
            // Reduce amount from the wallet
            await this.captainWalletService.addAmountToWallet(captain.id, 0, -data.amount);

            const request = {
                ...data,
                id: admin.firestore().collection(`ids`)
                    .doc().id,
                userType: 'captain',
                ownerId: captain.id,
                bankAccount,
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: captain.id,
                updatedBy: captain.id
            }

            await this.badgeService.incrementBadge("captainRequests");
            await this.requestRepository.setDocument(request);

            return request;
        } catch (error) {
            throw error;
        }
    }

    async getCaptainRequestsById(captainId, pagination) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);
            return await this.getCaptainRequests(captain, pagination);
        } catch (error) {
            throw error;
        }
    }

    async getCaptainRequestsByAuthId(authId, pagination) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            return await this.getCaptainRequests(captain, pagination);
        } catch (error) {
            throw error;
        }
    }

    async getCaptainRequests(captain, pagination) {
        try {
            const filter = [
                { key: 'ownerId', value: captain.id, operator: '==' },
                { key: 'userType', value: 'captain', operator: '==' }
            ]

            const requests = await this.requestRepository.listDocuments(filter, pagination);
            for(const request of requests){
                request.captain = captain;
            }
            return requests;
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
            const captain = await this.captainFindService.findCaptainById(request.ownerId);

            if (request.status !== 'pending') {
                throw new CustomError(this.language, 'request.error.cannotDecideRequest');
            }

            if (acceptRequest) {

                if (!transactionTimeStamp) {
                    throw new CustomError(this.language, 'request.error.missedTimeStamp');
                }
                await this.captainNotificationService.notifyCaptain(request.ownerId, {
                    en: i18n('en', 'request.notification.withdrawAcceptTitle'),
                    ar: i18n('ar', 'request.notification.withdrawAcceptTitle')
                }, {
                    en: i18n('en', 'request.notification.withdrawAcceptBody'),
                    ar: i18n('ar', 'request.notification.withdrawAcceptBody'),
                }, {
                    key: 'withdrawAccept',
                    value: `${requestId}`
                })

                return await this.requestRepository.editDocument(requestId, {
                    status: 'accepted',
                    transactionTimeStamp,
                    notes
                })
            } else {
                await this.captainWalletService.addAmountToWallet(request.ownerId, 0, request.amount);

                await this.captainNotificationService.notifyCaptain(request.ownerId, {
                    en: i18n('en', 'request.notification.withdrawRejectTitle'),
                    ar: i18n('ar', 'request.notification.withdrawRejectTitle')
                }, {
                    en: i18n('en', 'request.notification.withdrawRejectBody'),
                    ar: i18n('ar', 'request.notification.withdrawRejectBody'),
                }, {
                    key: 'withdrawReject',
                    value: `${requestId}`
                }, request.ownerId)

                await this.badgeService.decrementBadge("captainRequests");
                return await this.requestRepository.editDocument(requestId, {
                    status: 'rejected',
                    notes
                })
            }
        } catch (error) {
            throw error
        }
    }

    async confirmWithdrawRequest(requestId, transactionId, transactionUrl) {
        try {
            const request = await this.requestRepository.findDocumentById(requestId);
            if (!request) {
                throw new CustomError(this.language, 'request.error.requestNotFound');
            }

            if (request.status !== 'accepted') {
                throw new CustomError(this.language, 'request.error.cannotDecideRequest')
            }

            await this.captainWalletService.addAmountToWallet(request.ownerId, -request.amount, 0);

            const transaction = await this.transactionService.createTransaction({
                id: admin.firestore().collection(`ids`)
                    .doc().id,
                type: 'withdraw',
                amount: request.amount,
                objectType: 'request',
                objectId: request.id,
                payerType: 'captain',
                payerId: request.ownerId,
                payeeType: "external",
                payeeId: "-1",
                status: 'success',
                paymentMethod: 'wallet',
                paymentId: transactionId,
                createdBy: this.currentUser.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })

            await this.captainNotificationService.notifyCaptain(request.ownerId, {
                en: i18n('en', 'request.notification.withdrawConfirmTitle'),
                ar: i18n('ar', 'request.notification.withdrawConfirmTitle')
            }, {
                en: i18n('en', 'request.notification.withdrawConfirmBody'),
                ar: i18n('ar', 'request.notification.withdrawConfirmBody'),
            }, {
                key: 'withdrawConfirm',
                value: `${requestId}`
            });

            await this.badgeService.decrementBadge("captainRequests");
            return await this.requestRepository.editDocument
                (requestId, { status: 'confirmed', transactionId, transactionUrl })

        } catch (error) {
            throw error;
        }
    }

    async listCaptainRequests(filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: "userType", operator: "==", value: "captain" }
            ]
            const requests = await this.requestRepository.listDocuments(appendedFilter, pagination);
            for (const request of requests) {
                const captain = await this.captainFindService.findCaptainById(request.ownerId);
                request.captain = captain;
                console.log("captain in request");
                console.log(captain);
            }

            return requests;
        } catch (error) {
            throw error;
        }
    }

}