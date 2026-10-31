const ChefFindService = require('./chefFindService');
const MealFindService = require('../meal/mealFindService');
const CategoryFindService = require('../category/categoryFindService');

module.exports = class ChefCategoryService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.mealFindService = new MealFindService(this.currentUser, this.language);
        this.categoryFindService = new CategoryFindService(this.currentUser, this.language);
    }

    async listCategoriesOfChef(chefId) {
        try {
            const chef = await this.chefFindService.findChefByIdNotRemoved(chefId);
            const meals = await this.mealFindService.listAllChefMeals(chef);

            const categoriesSet = new Set();
            for (const meal of meals) {
                categoriesSet.add(meal.categoryId);
            }
            const categories = Array.from(categoriesSet);
            return categories;
        } catch (error) {
            throw error;
        }
    }

}