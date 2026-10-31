const CollectionRepository = require('../../database/collectionRepository');
const SubCollectionRepository = require('../../database/subCollectionRepository');
const ChefFindService = require('../chef/chefFindService');
const CustomError = require('../../error/customeError');

module.exports = class PromotionFindService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.promotionsRepository = new CollectionRepository("promotions");
        this.chefPromotionsRepository = new SubCollectionRepository("chefs", "promotions");
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
    }

    async listPromotions(filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                {
                    key: 'status', value: 'success', operator: '=='
                }
            ]
            const promotions = await this.promotionsRepository.listDocuments(appendedFilter, pagination);
            for (const promotion of promotions) {
                const chef = await this.chefFindService.findChefById(promotion.chefId);
                promotion.chef = chef;
            }
            return promotions;
        } catch (error) {
            throw error;
        }
    }

    async findPromotionById(promotionId) {
        try {
            const promotion = await this.promotionsRepository.findDocumentById(promotionId);
            if (!promotion) {
                throw new CustomError(this.language, 'promotion.error.promotionNotFound');
            }
            const chef = await this.chefFindService.findChefById(promotion.chefId);
            promotion.chef = chef;

            return promotion;
        } catch (error) {
            throw error;
        }
    }

    async listChefPromotionsById(chefId) {
        try {
            const promotions = await this.chefPromotionsRepository.listDocuments(chefId, [], undefined);
            const chef = await this.chefFindService.findChefById(chefId);
            for (const promotion of promotions) {
                promotion.chef = promotion;
            }
            return promotions;
        } catch (error) {
            throw error;
        }
    }

    async listChefPromotionsByAuthId(authId, filter, pagination) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const appendedFilter = [
                ...filter,
                {
                    key: 'status', value: 'success', operator: '=='
                }
            ]
            const promotions = await this.chefPromotionsRepository.listDocuments(chef.id, appendedFilter, pagination);
            for (const promotion of promotions) {
                promotion.chef = chef;
            }

            return promotions;
        } catch (error) {
            throw error;
        }
    }

}