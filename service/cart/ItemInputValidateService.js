const ChefFindService = require('../chef/chefFindService');
const MealFindService = require('../meal/mealFindService');
const CustomError = require('../../error/customeError');

module.exports = class ItemInputValidateService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.mealFindService = new MealFindService(this.currentUser, this.language);
    }

    async isItemValid(item){
        try{
            return await this.validateItem(item);
        }catch(error){
            return false;
        }
    }

    async validateItem(item) {
        try {
            const { chefId, mealId, quantity, sizeId, addons: itemAddons } = item;

            // Check if chef is found
            const chef = await this.chefFindService.findChefById(chefId);
            if (!chef) {
                throw new CustomError(this.language, 'chef.error.chefNotFound');
            }
            // Check if meal is found
            const meal = await this.mealFindService.findMealById(chefId, mealId);
            if (!meal) {
                throw new CustomError(this.language, 'meal.error.mealNotFound');
            }
            // check if quantity in accepted range
            if (quantity <= 0) {
                throw new CustomError(this.language, 'chef.error.wrongQuantity');
            }
            // Check size 
            const size = this.mealFindService.getSizeInMeal(sizeId, meal);
            if (!size) {
                throw new CustomError(this.language, 'cart.error.sizeNotFound');
            }

            // Check addons
            const addonsFound = itemAddons.every(itemAddon => {
                return itemAddon.quantity > 0 && this.mealFindService.isAddOnFoundInMeal(itemAddon.id, meal);
            })
            if (!addonsFound) {
                throw new CustomError(this.language, 'cart.error.addonNotFound');
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

}