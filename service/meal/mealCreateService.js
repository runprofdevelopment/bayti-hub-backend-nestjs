const admin = require('firebase-admin');
const ChefFindService = require('../chef/chefFindService');
const CategoryFindService = require('../category/categoryFindService');
const SubCollectionService = require('../../database/subCollectionRepository');
const AlgoliaService = require('../algoliaService');
const CustomError = require('../../error/customeError');
const VariablesService = require('../variablesService');

module.exports = class MealCreateService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.categoryFindService = new CategoryFindService(this.currentUser, this.language);
        this.algoliaService = new AlgoliaService(this.currentUser, this.language);
        this.mealRepository = new SubCollectionService("chefs", "meals");
        this.statsService = new VariablesService(this.currentUser, this.language, "stats");
    }

    async createMeal(data) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(this.currentUser.uid);
            // check if kitchen or sections not set yet
            if (!chef.kitchen || !chef.sections) {
                throw new CustomError(this.language, 'chef.error.cannotAddMeal');
            }
            // get category of the meal
            const categoryId = data.categoryId;
            const category = await this.categoryFindService.findCategoryById(categoryId);

            // get section of the meal
            const sectionId = data.sectionId;
            const chefSections = chef.sections;
            const section = this.findSection(sectionId, chefSections);
            if (!section) {
                throw new CustomError(this.language, 'chef.error.sectionNotFound');
            }

            if (data.sizes.length === 0) {
                throw new CustomError(this.language, 'meal.error.noSizes');
            }
            const meal = {
                id: admin.firestore().collection(`ids`).doc().id,
                ...data,
                chefId: chef.id,
                isEnabled: true,
                isRemoved: false,
                createdBy: chef.id,
                updatedBy: chef.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }

            await this.mealRepository.setDocument(chef.id, meal);

            const updatedChef = await this.chefFindService.findChefById(chef.id);
            // add chef to algolia
            await this.algoliaService.pushChefToAlgolia(updatedChef);

            // update stats aggregation for new users
            await this.statsService.incrementVariable("mealsCount");

            return meal;
        } catch (error) {
            throw error
        }
    }

    findSection(sectionId, sections) {
        for (const section of sections) {
            if (section.id === sectionId) {
                return section;
            }
        }

        return null;
    }

}