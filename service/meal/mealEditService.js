const ChefFindService = require('../chef/chefFindService');
const MealFindService = require('./mealFindService');
const AlgoliaService = require('../algoliaService');
const SubCollectionRepository = require('../../database/subCollectionRepository');

module.exports = class MealEditService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.mealFindService = new MealFindService(this.currentUser, this.language);
        this.algoliaService = new AlgoliaService(this.currentUser, this.language);
        this.mealsRepository = new SubCollectionRepository("chefs", "meals");
    }

    async editMealByChefAuthId(authId, mealId, mealUpdate) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            const meal = await this.mealFindService.findMealById(chef.id, mealId);
            return await this.editMeal(chef, meal, mealUpdate);
        } catch (error) {
            throw error;
        }
    }

    async editMealByChefId(chefId, mealId, mealUpdate) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            const meal = await this.mealFindService.findMealById(chefId, mealId);
            return await this.editMeal(chef, meal, mealUpdate);
        } catch (error) {
            throw error;
        }
    }

    async editMeal(chef, meal, mealUpdate) {
        try {
            await this.mealsRepository.editDocument(chef.id, meal.id, mealUpdate);
            // push chef to algolia
            const updatedChef = await this.chefFindService.findChefById(chef.id);
            await this.algoliaService.pushChefToAlgolia(updatedChef);
            return true;
        } catch (error) {
            throw error;
        }
    }

}