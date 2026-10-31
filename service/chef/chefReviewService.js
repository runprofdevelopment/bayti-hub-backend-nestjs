const SubCollectionRepository = require('../../database/subCollectionRepository');
const ChefFindService = require('../chef/chefFindService');
const ChefEditService = require('../chef/chefEditService');
const ValidateService = require('../validateService');

module.exports = class ChefReviewService {
    constructor(currentUser, language) {
        this.currentUser = currentUser
        this.language = language
        this.chefReviewRepository = new SubCollectionRepository("chefs", "reviews");
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefEditService = new ChefEditService(this.currentUser, this.language);
    }

    async addChefReview(chefId, chefReview) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            const chefRating = chef.rating ? chef.rating : 0;
            const reviewsCount = chef.reviewsCount ? chef.reviewsCount : 0;

            const newReviewsCount = reviewsCount + 1;
            const newRating = ValidateService.roundFloat(((chefRating / newReviewsCount) + (chefReview.rating / newReviewsCount)));
            // add review to chef
            await this.chefReviewRepository.setDocument(chefId, chefReview);
            // edit rating and reviewCount
            await this.chefEditService.editChef(chef, { rating: newRating, reviewsCount: newReviewsCount });

            return true;
        } catch (error) {
            throw error;
        }
    }

    async listChefReviewsByAuthId(authId, filter, pagination) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.listChefReviewsByChef(chef, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listChefReviewsById(chefId, filter, pagination) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            return await this.listChefReviewsByChef(chef, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listChefReviewsByChef(chef, filter, pagination) {
        try {
            return await this.chefReviewRepository.listDocuments(chef.id, filter, pagination);
        } catch (error) {
            throw error;
        }
    }


}