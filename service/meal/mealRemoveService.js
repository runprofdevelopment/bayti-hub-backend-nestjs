const ChefFindService = require('../chef/chefFindService');
const MealFindService = require('./mealFindService');
const SubCollectionRepository = require('../../database/subCollectionRepository');
const AlgoliaService = require('../algoliaService');
const VariablesService = require('../variablesService');

module.exports = class MealRemoveService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.mealFindService = new MealFindService(this.currentUser, this.language);
        this.mealsRepository = new SubCollectionRepository("chefs", "meals");
        this.algoliaService = new AlgoliaService();
        this.statsService = new VariablesService(this.currentUser, this.language, "stats");
    }

    async removeMealByAuthId(authId, mealId) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.removeMeal(chef, mealId);
        } catch (error) {
            throw error;
        }
    }

    async removeMealByChefId(chefId, mealId) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            return await this.removeMeal(chef, mealId);
        } catch (error) {
            throw error;
        }
    }

    async removeMeal(chef, mealId) {
        try {
            const meal = await this.mealFindService.findMealById(chef.id, mealId);
            await this.mealsRepository.editDocument(chef.id, meal.id, { isRemoved: true });
            const updatedChef = await this.chefFindService.findChefById(chef.id);
            // push chef to algolia
            
            await this.algoliaService.pushChefToAlgolia(updatedChef);

            await this.statsService.incrementVariableByValue("mealsCount", -1);

            return true;
        } catch (error) {
            throw error;
        }
    }

    async removeMeals(chef, meals) {
        try {
            for (const meal of meals) {
                await this.mealsRepository.editDocument(chef.id, meal.id, { isRemoved: true });
            }
            await this.statsService.incrementVariableByValue("mealsCount", -1 * meals.length);

            const updatedChef = await this.chefFindService.findChefById(chef.id);
            // push chef to algolia
            await this.algoliaService.pushChefToAlgolia(updatedChef);
            return true;
        } catch (error) {
            throw error;
        }
    }

    async removeSectionMeals(chefId, sectionId) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            const filter = [
                { key: 'sectionId', operator: '==', value: sectionId }
            ]
            const meals = await this.mealFindService.listMealsByFilter(chefId, filter);
            return await this.removeMeals(chef, meals);
        } catch (error) {
            throw error;
        }
    }

}