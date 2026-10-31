const admin = require('firebase-admin');
const functions = require("firebase-functions");
const AlRajhiBankGateway = require('../shared/payment-gateway/alRajhiBank');
const { serviceAccount } = require(`../../config/config`);
const TransactionService = require('../transactionService');
const AdminFindService = require('./adminFindService');
const VariablesService = require("../variablesService");
const SubCollectionRepository = require('../../database/subCollectionRepository');
const CustomError = require('../../error/customeError');

const REGION = 'europe-west1';

module.exports = class AdminWalletService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.adminId = -1;
        this.RajhiBankGateway = new AlRajhiBankGateway();
        this.adminFindService = new AdminFindService(this.currentUser, this.language);
        this.adminWalletRepository = new SubCollectionRepository('admins', 'wallets');
        this.transactionService = new TransactionService(this.currentUser, this.language);
        this.variablesService = new VariablesService(this.currentUser, this.language, "stats");
    }

    async rechargeAppWallet(authId, amount) {
        try {
            const adminObject = await this.adminFindService.findAdminByAuthId(authId);

            const newId = admin.firestore().collection(`ids`)
                .doc().id
            console.log("newId");
            console.log(newId);

            // ElRajhi gateway 
            const response = await this.RajhiBankGateway.purchase({
                amount: amount,
                trackId: newId,
                action: "1",
                language: this.language ? this.language : 'en',
                //responseURL: `http://localhost:5001/home-food-plus/europe-west1/paymentWebHook?processType=wallet-charging-app`,
                responseURL: `https://${REGION}-${serviceAccount.project_id}.cloudfunctions.net/paymentWebHook?processType=wallet-charging-app`,
                errorURL: "https://admin.homefood.app/auth/signin",
            })

            if (response.trackId && response.paymentId) {

                const transId = admin.firestore().collection(`ids`)
                    .doc().id;
                const transactionService = new TransactionService(this.currentUser, this.language)
                const transaction = await transactionService.createTransaction({
                    id: transId,
                    type: 'recharge',
                    trackId: response.trackId,
                    amount,
                    objectType: 'wallet',
                    objectId: "-1",
                    payerType: "external",
                    payerId: "-1",
                    payeeType: "app",
                    payeeId: "-1",
                    status: 'pending',
                    paymentMethod: 'wallet',
                    paymentId: response.paymentId,
                    createdBy: adminObject.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: adminObject.id,
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

    async withdrawFromAppWallet(authId, amount, transactionNo) {
        try {
            const adminObject = await this.adminFindService.findAdminByAuthId(authId);
            const wallet = await this.getAppWallet();
            if(wallet.balance < amount|| wallet.actualBalance < amount){
                throw new CustomError(this.language, 'wallet.error.notSufficientAmount');
            }
            await this.addAmountToWallet(- amount, -amount);

            const transId = admin.firestore().collection(`ids`).doc().id;
            const transactionService = new TransactionService(this.currentUser, this.language);
            const transaction = await transactionService.createTransaction({
                id: transId,
                type: 'withdraw',
                amount,
                objectType: 'wallet',
                objectId: "-1",
                payerType: "app",
                payerId: "-1",
                payeeType: "external",
                payeeId: "-1",
                status: 'success',
                paymentMethod: 'wallet',
                paymentId: transactionNo,
                createdBy: adminObject.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: adminObject.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return true;
        } catch (error) {
            throw error
        }
    }

    async getAppWallet() {
        try {
            const wallet = await this.adminWalletRepository.findDocumentById("-1", "-1");
            if (!wallet) {
                throw new CustomError(this.language, 'wallet.error.walletNotFound');
            }
            return wallet;
        } catch (error) {
            throw error
        }
    }

    async addAmountToWallet(amount, actualAmount) {
        try {
            const wallet = await this.getAppWallet();

            wallet.actualBalance = wallet.actualBalance + actualAmount;
            wallet.balance = wallet.balance + amount;

            if (wallet.actualBalance < 0 || wallet.balance < 0) {
                throw new CustomError(this.language, 'wallet.error.notSufficientAmount');
            }
            // Update updatedBy and updatedAt
            wallet.updatedAt = admin.firestore.FieldValue.serverTimestamp();
            wallet.updatedBy = "-1";

            return await this.adminWalletRepository.editDocument("-1", "-1", {
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