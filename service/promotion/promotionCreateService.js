const admin = require('firebase-admin');
const functions = require("firebase-functions");
const ChefFindService = require('../chef/chefFindService');
const ChefEditService = require('../chef/chefEditService');
const ChefWalletService = require('../chef/chefWalletService');
const TransactionService = require('../transactionService');
const PromotionFindService = require('../promotion/promotionFindService');
const CollectionRepository = require('../../database/collectionRepository');
const SubCollectionRepository = require('../../database/subCollectionRepository');
const RajhiBankGateway = require('../shared/payment-gateway/alRajhiBank');
const SettingsService = require('../settingsService');
const {serviceAccount} = require("../../config/config");
const CustomError = require('../../error/customeError');
const { i18n } = require('../../i18n');
const AdminWalletService = require('../admin/adminWalletService');

const REGION = 'europe-west1';

module.exports = class PromotionCreateService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefEditService = new ChefEditService(this.currentUser, this.language);
        this.promotionRepository = new CollectionRepository("promotions");
        this.chefPromotionRepository = new SubCollectionRepository("chefs", "promotions");
        this.chefWalletService = new ChefWalletService(this.currentUser, this.language);
        this.adminWalletService = new AdminWalletService(this.currentUser, this.language);
        this.transactionService = new TransactionService(this.currentUser, this.language);
        this.RajhiBankGateway = new RajhiBankGateway();
        this.promotionFindService = new PromotionFindService(this.currentUser, this.language);
        this.SettingsService = new SettingsService(this.currentUser, this.language);
    }

    async promotChef(authId, promotionInput) {
        try {
            const startDate = promotionInput.startDate;
            const endDate = promotionInput.endDate;
            const paymentMethod = promotionInput.paymentMethod

            // check if address and kitchen and sections are set
            const settings = await this.SettingsService.findSettings();
            if (!settings || !settings.promotionPrice) {
                throw new CustomError(this.language, 'promotion.error.cannotPromote');
            }
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const chefPromotions = await this.promotionFindService.listChefPromotionsById(chef.id);
            for (const promotion of chefPromotions) {
                if (!this.isPromotionRight(promotion, startDate)) {
                    throw new CustomError(this.language, 'promotion.error.overlapDate');
                }
            }

            // calculate the required amount to run the promotion
            const promotionPrice = settings.promotionPrice;
            const promotionDays = this.getPromotionDays(startDate, endDate);
            const amount = promotionPrice * promotionDays;

            const promotion = {
                id: admin.firestore().collection(`ids`).doc().id,
                chefId: chef.id,
                status: "shadow",
                startDate,
                endDate,
                amount,
                daysCount: promotionDays,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: chef.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: chef.id
            }
            await this.promotionRepository.setDocument(promotion);

            if (paymentMethod === "wallet") {
                return await this.executeWalletPayment(chef, amount, promotion.id);
            } else if (paymentMethod === "visa") {
                return await this.executeVisaPayment(chef, amount, promotion.id);
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    async executeWalletPayment(chef, amount, promotionId) {
        try {
            await this.chefWalletService.addAmountToWallet(chef.id, -amount, - amount);
            await this.adminWalletService.addAmountToWallet(amount, amount);
            const transaction = await this.transactionService.createTransaction({
                id: await admin.firestore().collection(`ids`).doc().id,
                type: 'promotion',
                amount,
                trackId: -1,
                objectType: 'promotion',
                objectId: promotionId,
                payerType: 'chef',
                payerId: chef.id,
                payeeType: 'app',
                payeeId: "-1",
                status: 'success',
                paymentMethod: 'wallet',
                paymentId: -1,
                createdBy: chef.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: chef.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            })
            return await this.successPromotionPayment(promotionId);
        } catch (error) {
            throw error;
        }
    }

    async executeVisaPayment(chef, amount, promotionId) {
        try {
            // ElRajhi gateway 
            const response = await this.RajhiBankGateway.purchase({
                amount: amount,
                trackId: admin.firestore().collection(`ids`).doc().id,
                action: "1",
                language: this.language ? this.language : 'en',
                responseURL: functions.config().env ? `https://${REGION}-${serviceAccount.project_id}.cloudfunctions.net/paymentWebHook?processType=promotion` :
                    `http://localhost:5001/home-food-plus/europe-west1/paymentWebHook?processType=promotion`,
                errorURL: "https://admin.homefood.app/auth/signin",
            })

            if (response.trackId && response.paymentId) {

                const transaction = await this.transactionService.createTransaction({
                    id: await admin.firestore().collection(`ids`).doc().id,
                    type: 'promotion',
                    trackId: response.trackId,
                    amount,
                    objectType: 'promotion',
                    objectId: promotionId,
                    payerType: 'chef',
                    payerId: chef.id,
                    payeeType: 'app',
                    payeeId: "-1",
                    status: 'pending',
                    paymentMethod: 'visa',
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
            throw error;
        }
    }

    async successPromotionPayment(promotionId) {
        try {
            const promotion = await this.promotionFindService.findPromotionById(promotionId);
            promotion.status = "success";

            // update promotion status
            await this.promotionRepository.editDocument(promotionId, { status: "success" });
            await this.chefPromotionRepository.setDocument(promotion.chefId, promotion);

            return promotion;
        } catch (error) {
            throw error;
        }
    }

    getPromotionDays(startDate, endDate) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const today = new Date();

            if (start == "Invalid Date" || end == "Invalid Date") {
                throw new CustomError(this.language, 'promotion.error.wrongDate');
            }
            if (start > end || today >= start) {
                throw new CustomError(this.language, 'promotion.error.wrongDate');
            }
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))+1;

            return diffDays;
        } catch (error) {
            throw error;
        }
    }

    isPromotionRight(promotion, startDate) {
        try {
            const start = new Date(promotion.startDate);
            const end = new Date(promotion.endDate);

            const requiredDate = new Date(startDate);
            if (requiredDate >= start && requiredDate <= end) {
                return false;
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}