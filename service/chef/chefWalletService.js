const admin = require('firebase-admin');
const functions = require("firebase-functions");
const AlRajhiBankGateway = require('../shared/payment-gateway/alRajhiBank');
const {serviceAccount} = require(`../../config/config`);
const TransactionService = require('../transactionService');
const ChefFindService = require('./chefFindService');
const VariablesService = require("../variablesService");
const SubCollectionRepository = require('../../database/subCollectionRepository');
const CustomError = require('../../error/customeError');
const AdminWalletService = require('../admin/adminWalletService');
const ChefNotificationService = require('./chefNotificationService');
const { i18n } = require('../../i18n');
const OrderFindService = require('../order/orderFindService');
const CollectionRepository = require('../../database/collectionRepository');

const REGION = 'europe-west1'

module.exports = class ChefWalletService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.RajhiBankGateway = new AlRajhiBankGateway();
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefWalletRepository = new SubCollectionRepository('chefs', 'wallets');
        this.transactionService = new TransactionService(this.currentUser, this.language);
        this.variablesService = new VariablesService(this.currentUser, this.language, "stats");
        this.adminWalletService = new AdminWalletService(this.currentUser, this.language);
        this.chefNotificationService = new ChefNotificationService(this.currentUser, this.language);
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.chefRepository = new CollectionRepository("chefs");
    }

    async creatEmptyWalletForChef(chef) {
        try {
            const chefId = chef.id;
            const wallet = {
                id: chefId,
                chefId,
                balance: 0,
                actualBalance: 0,
                createdBy: chefId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: chefId
            }

            return await this.chefWalletRepository.setDocument(chefId, wallet);
        } catch (error) {
            throw error;
        }
    }

    async rechargeWalletForChefByAuthId(authUid, amount) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authUid);

            const newId = admin.firestore().collection(`ids`)
                .doc().id

            // ElRajhi gateway 
            const response = await this.RajhiBankGateway.purchase({
                amount: amount,
                trackId: newId,
                action: "1",
                language: this.language ? this.language : 'en',
                //responseURL: `http://localhost:5001/home-food-plus/europe-west1/paymentWebHook?processType=wallet-charging-chef`,
                responseURL: `https://${REGION}-${serviceAccount.project_id}.cloudfunctions.net/paymentWebHook?processType=wallet-charging-chef`,
                errorURL: "https://admin.homefood.app/auth/signin",
            })

            if (response.trackId && response.paymentId) {

                const transId = await admin.firestore().collection(`ids`)
                    .doc().id
                const transactionService = new TransactionService(this.currentUser, this.language)
                const transaction = await transactionService.createTransaction({
                    id: transId,
                    type: 'recharge',
                    trackId: response.trackId,
                    amount,
                    objectType: 'wallet',
                    objectId: chef.id,
                    payerType: "external",
                    payerId: "-1",
                    payeeType: 'chef',
                    payeeId: chef.id,
                    status: 'pending',
                    paymentMethod: 'wallet',
                    paymentId: response.paymentId,
                    createdBy: chef.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: chef.id,
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

    async rechargeChefWalletByAdmin(chefId, amount, notes) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);

            const appWallet = await this.adminWalletService.getAppWallet();
            if(appWallet.actualAmount < amount){
                throw new CustomError(this.language, 'wallet.error.notSufficientAmount');
            }
            
            await this.adminWalletService.addAmountToWallet(-amount,  - amount);
            await this.addAmountToWallet(chefId, amount, amount);

            const transactionService = new TransactionService(this.currentUser, this.language);
            const transaction = await transactionService.createTransaction({
                id: admin.firestore().collection(`ids`).doc().id,
                type: 'rechargeByAdmin',
                trackId: chef.id,
                amount,
                objectType: 'wallet',
                objectId: chef.id,
                payerType: "app",
                payerId: "-1",
                payeeType: 'chef',
                payeeId: chef.id,
                status: 'success',
                paymentMethod: 'wallet',
                paymentId: -1,
                notes,
                createdBy: chef.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: chef.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // notification for captain
            await this.chefNotificationService.notifyChef(chef.id, {
                en: i18n('en', 'wallet.notification.rechargeWalletTitle'),
                ar: i18n('ar', 'wallet.notification.rechargeWalletTitle')
            }, {
                en: notes.en,
                ar: notes.ar,
            }, {
                key: 'wallet',
                value: `${chef.id}`
            });
        } catch (error) {
            throw error;
        }
    }


    async getWalletByChefId(chefId) {
        try {
            const wallet = await this.chefWalletRepository.findDocumentById(chefId, chefId);
            if (!wallet) {
                throw new CustomError(this.language, 'wallet.error.walletNotFound')
            }
            return wallet
        } catch (error) {
            throw error
        }
    }

    async getWalletByAuthUid(authUid) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authUid);
            const wallet = await this.chefWalletRepository.findDocumentById(chef.id, chef.id);
            if (!wallet) {
                throw new CustomError(this.language, 'wallet.error.walletNotFound')
            }
            return wallet;
        } catch (error) {
            throw error
        }
    }

    async listWallets(filter, pagination) {
        try {
            const chefs = await this.chefFindService.listChefs(filter, pagination);
            const chefsWallets = [];

            for (const chef of chefs) {
                const wallet = await this.getWalletByChefId(chef.id);
                wallet.chef = chef;

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
                const todayAmounts = await this.orderFindService.calculateUserSalesInPeriod("chef", chef.id, startOfToday, now);
                wallet.dayAmount = todayAmounts.chefAmount;

                // Get week amount
                const weekAmounts = await this.orderFindService.calculateUserSalesInPeriod("chef", chef.id, startOfWeek, now);
                wallet.weekAmount = weekAmounts.chefAmount;

                // Get month amount
                const monthAmounts = await this.orderFindService.calculateUserSalesInPeriod("chef", chef.id, startOfMonth, now);
                wallet.monthAmount = monthAmounts.chefAmount;
                // Get month amount
                const yearAmounts = await this.orderFindService.calculateUserSalesInPeriod("chef", chef.id, startOfYear, now);
                wallet.yearAmount = yearAmounts.chefAmount;

                chefsWallets.push(wallet);
            }

            return chefsWallets;
        } catch (error) {
            throw error
        }
    }

    async addAmountToWallet(walletId, amount, actualAmount) {
        try {
            const wallet = await this.getWalletByChefId(walletId);

            wallet.actualBalance = wallet.actualBalance + actualAmount;
            wallet.balance = wallet.balance + amount;

            if (wallet.actualBalance < 0 || wallet.balance < 0) {
                throw new CustomError(this.language, 'wallet.error.notSufficientAmount');
            }
            // Update updatedBy and updatedAt
            wallet.updatedAt = admin.firestore.FieldValue.serverTimestamp();
            wallet.updatedBy = walletId;

            // Add amount and actual balance 
            await this.variablesService.incrementVariableByValue("totalChefWalletsAmount", amount);
            await this.variablesService.incrementVariableByValue("totalChefWalletsActualAmount", actualAmount);

            await this.chefRepository.editDocument(walletId, {balance: wallet.balance});

            return await this.chefWalletRepository.editDocument(walletId, walletId, {
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