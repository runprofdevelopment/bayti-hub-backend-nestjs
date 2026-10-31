const admin = require('firebase-admin');
const ChefFindService = require('../chef/chefFindService');
const ChefEditService = require("../chef/chefEditService");
const ChefWalletService = require('../chef/chefWalletService');
const TransactionService = require('../transactionService');
const PromotionFindService = require('../promotion/promotionFindService');
const CollectionRepository = require('../../database/collectionRepository');
const SubCollectionRepository = require('../../database/subCollectionRepository');
const CustomError = require('../../error/customeError');

module.exports = class PromotionRemoveService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.promotionRepository = new CollectionRepository("promotions");
        this.chefPromotionRepository = new SubCollectionRepository("chefs", "promotions");
        this.chefWalletService = new ChefWalletService(this.currentUser, this.language);
        this.transactionService = new TransactionService(this.currentUser, this.language);
        this.promotionFindService = new PromotionFindService(this.currentUser, this.language);
        this.chefEditService = new ChefEditService(this.currentUser, this.language);
    }

    async removePromotion(promotionId) {
        try {
            const promotion = await this.promotionFindService.findPromotionById(promotionId);
            if (!promotion) {
                throw new CustomError(this.language, "promotion.error.promotionNotFound");
            }
            const chef = await this.chefFindService.findChefById(promotion.chefId);
            if (!chef || chef.isRemoved) {
                throw new CustomError(this.language, "chef.error.chefNotFound");
            }


            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            const promotionStartDateArray = promotion.startDate.split("-");
            const startDate = new Date(promotionStartDateArray[0], Number(promotionStartDateArray[1]) + 1, promotionStartDateArray[2]);

            const promotionEndDateArray = promotion.endDate.split("-");
            const endDate = new Date(promotionEndDateArray[0], Number(promotionEndDateArray[1]) + 1, promotionEndDateArray[2]);


            if (currentDate <= endDate) {
                // Calculate the refund amount
                const dayAmount = promotion.amount / promotion.daysCount;
                const daysCount = Math.min(Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)), Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
                const refundAmount = daysCount * dayAmount;

                await this.chefWalletService.addAmountToWallet(promotion.chefId, refundAmount, refundAmount);
                const transaction = await this.transactionService.createTransaction({
                    id: admin.firestore().collection(`ids`).doc().id,
                    type: 'refund',
                    amount: refundAmount,
                    trackId: -1,
                    objectType: 'wallet',
                    objectId: promotion.chefId,
                    payerType: "app",
                    payerId: "-1",
                    payeeType: 'chef',
                    payeeId: promotion.chefId,
                    status: 'success',
                    paymentMethod: 'wallet',
                    paymentId: -1,
                    createdBy: promotion.chefId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedBy: promotion.chefId,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            if (currentDate >= startDate && currentDate <= endDate) {
                await this.chefEditService.editChef(chef, { promoted: false });
            }
            await this.promotionRepository.editDocument(promotionId, { status: "removed" });
            await this.chefPromotionRepository.editDocument(promotion.chefId, promotionId, { status: "removed" });
            return true;
        } catch (error) {
            throw error;
        }
    }
}