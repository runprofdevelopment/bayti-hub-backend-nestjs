const admin = require('firebase-admin');
const AlRajhiBankGateway = require('../shared/payment-gateway/alRajhiBank');
const { serviceAccount } = require("../../config/config");
const TransactionService = require('../transactionService');
const ClientFindService = require('./clientFindService');
const VariablesService = require("../variablesService");
const SubCollectionRepository = require('../../database/subCollectionRepository');
const CustomError = require('../../error/customeError');
const AdminWalletService = require('../admin/adminWalletService');
const ClientNotificationService = require('./clientNotificationService');
const { i18n } = require('../../i18n');
const OrderFindService = require('../order/orderFindService');
const CollectionRepository = require('../../database/collectionRepository');


const REGION = 'europe-west1'

module.exports = class ClientWalletService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.RajhiBankGateway = new AlRajhiBankGateway();
        this.clientFindService = new ClientFindService(this.user, this.currentUser, this.language);
        this.clientWalletRepository = new SubCollectionRepository('clients', 'wallets');
        this.transactionService = new TransactionService(this.user, this.currentUser, this.language);
        this.variablesService = new VariablesService(this.currentUser, this.language, "stats");
        this.adminWalletService = new AdminWalletService(this.currentUser, this.language);
        this.clientNotificationService = new ClientNotificationService(this.currentUser, this.language);
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.clientRepository = new CollectionRepository("clients");
    }

    async creatEmptyWalletForClient(client) {
        try {
            const clientId = client.id;

            const wallet = {
                id: clientId,
                clientId,
                balance: 0,
                actualBalance: 0,
                createdBy: clientId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: clientId
            }

            return await this.clientWalletRepository.setDocument(clientId, wallet);
        } catch (error) {
            throw error;
        }
    }

    async rechargeClientWalletByAdmin(clientId, amount, notes) {
        try {
            const client = await this.clientFindService.findClientById(clientId);

            const appWallet = await this.adminWalletService.getAppWallet();
            if (appWallet.actualAmount < amount) {
                throw new CustomError(this.language, 'wallet.error.notSufficientAmount');
            }

            await this.adminWalletService.addAmountToWallet(- amount, - amount);
            await this.addAmountToWallet(clientId, amount, amount);

            const transactionService = new TransactionService(this.currentUser, this.language);
            const transaction = await transactionService.createTransaction({
                id: admin.firestore().collection(`ids`).doc().id,
                type: 'rechargeByAdmin',
                trackId: client.id,
                amount,
                objectType: 'wallet',
                objectId: client.id,
                payerType: 'app',
                payerId: "-1",
                payeeType: 'client',
                payeeId: client.id,
                status: 'success',
                paymentMethod: 'wallet',
                paymentId: -1,
                notes,
                createdBy: client.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: client.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // notification for cleint
            await this.clientNotificationService.notifyClient(client.id, {
                en: i18n('en', 'wallet.notification.rechargeWalletTitle'),
                ar: i18n('ar', 'wallet.notification.rechargeWalletTitle')
            }, {
                en: notes.en,
                ar: notes.ar,
            }, {
                key: 'wallet',
                value: `${client.id}`
            });

        } catch (error) {
            throw error;
        }
    }

    async rechargeWalletForAuthId(authId, amount) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const newId = admin.firestore().collection(`ids`).doc().id

            // ElRajhi gateway 
            const response = await this.RajhiBankGateway.purchase({
                amount: amount,
                trackId: newId,
                action: "1",
                language: this.language ? this.language : 'en',
                //responseURL: `http://localhost:5001/home-food-plus/europe-west1/paymentWebHook?processType=wallet-charging-client`,
                responseURL: `https://${REGION}-${serviceAccount.project_id}.cloudfunctions.net/paymentWebHook?processType=wallet-charging-client`,
                errorURL: "https://admin.homefood.app/auth/signin",
            })

            if (response.trackId && response.paymentId) {

                const transId = await admin.firestore().collection(`ids`).doc().id
                const transactionService = new TransactionService(this.currentUser, this.language)
                const transaction = await transactionService.createTransaction({
                    id: transId,
                    type: 'recharge',
                    trackId: response.trackId,
                    amount,
                    objectType: 'wallet',
                    objectId: client.id,
                    payerType: "client",
                    payerId: client.id,
                    payeeType: 'app',
                    payeeId: "-1",
                    status: 'pending',
                    paymentMethod: 'wallet',
                    paymentId: response.paymentId,
                    createdBy: client.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: client.id,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })

                return {
                    transactionId: transaction.id,
                    paymentId: response.paymentId,
                    paymentPageUrl: response.paymentPageUrl,
                }
            }
        } catch (error) {
            throw error
        }
    }

    async getWalletByClientId(clientId) {
        try {
            const wallet = await this.clientWalletRepository.findDocumentById(clientId, clientId);
            if (!wallet) {
                throw new CustomError(this.language, 'wallet.error.walletNotFound')
            }
            return wallet;
        } catch (error) {
            throw error;
        }
    }

    async getWalletByAuthId(authId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const wallet = await this.clientWalletRepository.findDocumentById(client.id, client.id);
            if (!wallet) {
                throw new CustomError(this.language, 'wallet.error.walletNotFound')
            }
            return wallet
        } catch (error) {
            throw error;
        }
    }

    async listWallets(filter, pagination) {
        try {
            const clients = await this.clientFindService.listClients(filter, pagination);
            const clientsWallets = []

            for (const client of clients) {
                const wallet = await this.getWalletByClientId(client.id);
                wallet.client = client;

                const now = new Date();

                // Start of the day
                const startOfToday = new Date();
                startOfToday.setHours(0); startOfToday.setMinutes(0); startOfToday.setSeconds(0);

                // Start of the week
                const startOfWeek = new Date();
                const weekDay = (startOfWeek.getDay() + 1) % 7;
                startOfWeek.setDate(startOfWeek.getDate() - weekDay);
                startOfWeek.setHours(0); startOfWeek.setMinutes(0); startOfWeek.setSeconds(0);

                // Start of the month
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0); startOfMonth.setMinutes(0); startOfMonth.setSeconds(0);
                // Start of the year
                const startOfYear = new Date();
                startOfYear.setFullYear(startOfYear.getFullYear() - 100);
                // Get today amount
                const todayAmounts = await this.orderFindService.calculateUserSalesInPeriod("client", client.id, startOfToday, now);
                wallet.dayAmount = todayAmounts.clientAmount;

                // Get week amount
                const weekAmounts = await this.orderFindService.calculateUserSalesInPeriod("client", client.id, startOfWeek, now);
                wallet.weekAmount = weekAmounts.clientAmount;

                // Get month amount
                const monthAmounts = await this.orderFindService.calculateUserSalesInPeriod("client", client.id, startOfMonth, now);
                wallet.monthAmount = monthAmounts.clientAmount;
                // Get year amount
                const yearAmounts = await this.orderFindService.calculateUserSalesInPeriod("client", client.id, startOfYear, now);
                wallet.yearAmount = yearAmounts.clientAmount;
                clientsWallets.push(wallet);
            }

            return clientsWallets;
        } catch (error) {
            throw error;
        }
    }

    async addAmountToWallet(walletId, amount, actualAmount) {
        try {
            const wallet = await this.getWalletByClientId(walletId);

            wallet.actualBalance = wallet.actualBalance + actualAmount;
            wallet.balance = wallet.balance + amount;

            if (wallet.actualBalance < 0 || wallet.balance < 0) {
                throw new CustomError(this.language, 'wallet.error.notSufficientAmount');
            }
            // updatedBy and updatedAt
            wallet.updatedAt = admin.firestore.FieldValue.serverTimestamp();
            wallet.updatedBy = walletId;

            await this.variablesService.incrementVariableByValue("totalClientWalletsAmount", amount);
            await this.variablesService.incrementVariableByValue("totalClientWalletsActualAmount", actualAmount);

            await this.clientRepository.editDocument(walletId, { balance: wallet.balance });

            return await this.clientWalletRepository.editDocument(walletId, walletId, {
                actualBalance: wallet.actualBalance,
                balance: wallet.balance,
                updatedBy: wallet.updatedBy,
                updatedAt: wallet.updatedAt
            });
        } catch (error) {
            throw error;
        }
    }
}