const admin = require('firebase-admin');
const AlRajhiBankGateway = require('../shared/payment-gateway/alRajhiBank');
const { serviceAccount } = require(`../../config/config`);
const TransactionService = require('../transactionService');
const CaptainFindService = require('./captainFindService');
const VariablesService = require("../variablesService");
const SubCollectionRepository = require('../../database/subCollectionRepository');
const CustomError = require('../../error/customeError');
const AdminWalletService = require('../admin/adminWalletService');
const CaptainNotificationService = require('./captainNotificationService');
const { i18n } = require('../../i18n');
const OrderFindService = require('../order/orderFindService');
const CollectionRepository = require('../../database/collectionRepository');

const REGION = 'europe-west1'

module.exports = class CaptainWalletService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.RajhiBankGateway = new AlRajhiBankGateway();
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
        this.captainWalletRepository = new SubCollectionRepository('captains', 'wallets');
        this.transactionService = new TransactionService(this.currentUser, this.language);
        this.variablesService = new VariablesService(this.currentUser, this.language, "stats");
        this.adminWalletService = new AdminWalletService(this.currentUser, this.language);
        this.captainNotificationService = new CaptainNotificationService(this.currentUser, this.language);
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.captainRepository = new CollectionRepository("captains");
    }

    async creatEmptyWalletForCaptain(captain) {
        try {
            const captainId = captain.id;
            const wallet = {
                id: captainId,
                captainId,
                balance: 0,
                actualBalance: 0,
                createdBy: captainId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: captainId
            }

            return await this.captainWalletRepository.setDocument(captainId, wallet);
        } catch (error) {
            throw error;
        }
    }

    async rechargeWalletForCaptianByAuthId(authId, amount) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);

            const newId = admin.firestore().collection(`ids`)
                .doc().id

            // ElRajhi gateway 
            const response = await this.RajhiBankGateway.purchase({
                amount: amount,
                trackId: newId,
                action: "1",
                language: this.language ? this.language : 'en',
                //responseURL: `http://localhost:5001/home-food-plus/europe-west1/paymentWebHook?processType=wallet-charging-captain`,
                responseURL: `https://${REGION}-${serviceAccount.project_id}.cloudfunctions.net/paymentWebHook?processType=wallet-charging-captain`,
                errorURL: "https://admin.homefood.app/auth/signin",
            })

            if (response.trackId && response.paymentId) {

                const transId = await admin.firestore().collection(`ids`)
                    .doc().id;
                const transactionService = new TransactionService(this.currentUser, this.language)
                const transaction = await transactionService.createTransaction({
                    id: transId,
                    type: 'recharge',
                    trackId: response.trackId,
                    amount,
                    objectType: 'wallet',
                    objectId: captain.id,
                    payerType: "external",
                    payerId: "-1",
                    payeeType: 'captain',
                    payeeId: captain.id,
                    status: 'pending',
                    paymentMethod: 'wallet',
                    paymentId: response.paymentId,
                    createdBy: captain.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: captain.id,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })

                return {
                    transactionId: transaction.id,
                    paymentId: response.paymentId,
                    paymentPageUrl: response.paymentPageUrl,
                }
            }
        } catch (error) {
            throw error;
        }

    }

    async rechargeCaptainWalletByAdmin(captainId, amount, notes) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);

            const appWallet = await this.adminWalletService.getAppWallet();
            if (appWallet.actualAmount < amount) {
                throw new CustomError(this.language, 'wallet.error.notSufficientAmount');
            }

            await this.adminWalletService.addAmountToWallet(- amount, - amount);
            await this.addAmountToWallet(captainId, amount, amount);

            const transactionService = new TransactionService(this.currentUser, this.language);
            const transaction = await transactionService.createTransaction({
                id: admin.firestore().collection(`ids`).doc().id,
                type: 'recharge',
                trackId: captain.id,
                amount,
                objectType: 'wallet',
                objectId: captain.id,
                payerType: "app",
                payerId: "-1",
                payeeType: 'captain',
                payeeId: captain.id,
                status: 'success',
                paymentMethod: 'wallet',
                paymentId: -1,
                notes,
                createdBy: captain.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: captain.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // notification for captain
            await this.captainNotificationService.notifyCaptain(captain.id, {
                en: i18n('en', 'wallet.notification.rechargeWalletTitle'),
                ar: i18n('ar', 'wallet.notification.rechargeWalletTitle')
            }, {
                en: notes.en,
                ar: notes.ar,
            }, {
                key: 'wallet',
                value: `${captain.id}`
            });
        } catch (error) {
            throw error;
        }
    }


    async getWalletByCaptainId(captainId) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);
            const wallet = await this.captainWalletRepository.findDocumentById(captainId, captainId);
            if (!wallet) {
                throw new CustomError(this.language, 'wallet.error.walletNotFound');
            }
            return wallet;
        } catch (error) {
            throw error;
        }
    }

    async getWalletByAuthId(authId) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            const wallet = await this.captainWalletRepository.findDocumentById(captain.id, captain.id);
            if (!wallet) {
                throw new CustomError(this.language, 'wallet.error.walletNotFound');
            }
            return wallet;
        } catch (error) {
            throw error;
        }
    }

    async listWallets(filter, pagination) {
        try {

            const captains = await this.captainFindService.listCaptains(filter, pagination);
            const captainsWallets = [];

            for (const captain of captains) {
                const wallet = await this.captainWalletRepository.findDocumentById(captain.id, captain.id);
                wallet.captain = captain;

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
                const todayAmounts = await this.orderFindService.calculateUserSalesInPeriod("captain", captain.id, startOfToday, now);
                wallet.dayAmount = todayAmounts.captainAmount;

                // Get week amount
                const weekAmounts = await this.orderFindService.calculateUserSalesInPeriod("captain", captain.id, startOfWeek, now);
                wallet.weekAmount = weekAmounts.captainAmount;

                // Get month amount
                const monthAmounts = await this.orderFindService.calculateUserSalesInPeriod("captain", captain.id, startOfMonth, now);
                wallet.monthAmount = monthAmounts.captainAmount;

                // Get year amount
                const yearAmounts = await this.orderFindService.calculateUserSalesInPeriod("captain", captain.id, startOfYear, now);
                wallet.yearAmount = yearAmounts.captainAmount;
                captainsWallets.push(wallet);
            }

            return captainsWallets;
        } catch (error) {
            throw error
        }
    }

    async addAmountToWallet(walletId, amount, actualAmount) {
        try {
            const wallet = await this.getWalletByCaptainId(walletId);

            wallet.actualBalance = wallet.actualBalance + actualAmount;
            wallet.balance = wallet.balance + amount;

            if (wallet.actualBalance < 0 || wallet.balance < 0) {
                throw new CustomError(this.language, 'wallet.error.notSufficientAmount');
            }
            // Update updatedBy and updatedAt
            wallet.updatedAt = admin.firestore.FieldValue.serverTimestamp();
            wallet.updatedBy = walletId;

            await this.variablesService.incrementVariableByValue("totalCaptainWalletsAmount", amount);
            await this.variablesService.incrementVariableByValue("totalCaptainWalletsActualAmount", actualAmount);

            await this.captainRepository.editDocument(walletId, { balance: wallet.balance });

            return await this.captainWalletRepository.editDocument(walletId, walletId, {
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