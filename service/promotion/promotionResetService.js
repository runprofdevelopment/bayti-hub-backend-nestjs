const CollectionRepository = require('../../database/collectionRepository');
const SubCollectionRepository = require('../../database/subCollectionRepository');
const ChefFindService = require('../chef/chefFindService');
const ChefEditService = require('../chef/chefEditService');
const PromotionFindService = require('../promotion/promotionFindService');
const CustomError = require('../../error/customeError');

module.exports = class PromotionResetService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefEditService = new ChefEditService(this.currentUser, this.language);
        this.promotionFindService = new PromotionFindService(this.currentUser, this.language);
        this.promotionsRepository = new CollectionRepository()
    }

    async resetPromotedChefs() {
        try {
            const filter = [
                { key: 'promoted', value: true, operator: '==' },
                { key: 'isRemoved', value: false, operator: '==' },
                { key: 'isEnabled', value: true, operator: '==' }
            ]
            const chefs = await this.chefFindService.listChefs(filter, undefined);
            const promises = [];

            for (const chef of chefs) {
                promises.push(this.chefEditService.editChef(chef, { promoted: false }));
            }
            await Promise.all(promises);

            return true;
        } catch (error) {
            throw error;
        }
    }

    async executePromotions() {
        try {
            const today = new Date();
            const year = today.getFullYear();
            let month = (today.getMonth()+1);
            if(month < 10) month = `0${month}`;
            const day  = today.getDate();
            if(day < 10) day = `0${day}`;

            const filter = [
                { key: 'startDate', value: `${year}-${month}-${day}`, operator: '<=' },
            ]
            let promotions = await this.promotionFindService.listPromotions(filter, undefined);
            console.log(promotions.length);
            promotions = promotions.filter(promotion => promotion.endDate >= `${year}-${month}-${day}`);
            console.log(promotions.length);
            
            const promises = [];
            for (const promotion of promotions) {
                promises.push(this.chefEditService.editChefById(promotion.chefId, { promoted: true }));
            }
            await Promise.all(promises);

            return true;
        } catch (error) {
            throw error;
        }
    }

    async listChefPromotionsById(chefId) {
        try {
            return await this.chefPromotionsRepository.listDocuments(chefId, [], undefined);
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
            return await this.chefPromotionsRepository.listDocuments(chef.id, appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

}

