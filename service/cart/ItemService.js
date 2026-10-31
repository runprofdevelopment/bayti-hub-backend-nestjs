const ChefFindService = require('../chef/chefFindService');
const MealFindService = require('../meal/mealFindService');
const ValidateService = require('../validateService');
const CustomError = require('../../error/customeError');

module.exports = class ItemService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.mealFindService = new MealFindService(this.currentUser, this.language);
    }

    async validateItem(item) {
        const { chefId, mealId, quantity, sizeId, addons: itemAddons } = item;

        // Check if meal is found
        const meal = await this.mealFindService.findMealById(chefId, mealId);
        if (!meal) {
            return null;
        }
        // check if quantity in accepted range
        if (quantity <= 0) {
            return null;
        }
        // Check size 
        const size = this.mealFindService.getSizeInMeal(sizeId, meal);
        if (!size) {
            return null;
        }
        const mealPrice = size.price * quantity;

        // cal addons price
        const addonsItems = [];
        const addOnsPrice = itemAddons.reduce((sum, itemAddon) => {
            const addon = this.mealFindService.getAddOnInMeal(itemAddon.id, meal);
            if (addon) {
                addonsItems.push({ addon, quantity: itemAddon.quantity });
                return sum + (addon.price * itemAddon.quantity);
            }
            return sum;
        }, 0);
        item.addonsItems = addonsItems;
        item.value = ValidateService.roundFloat(mealPrice + addOnsPrice);

        return item;
    }

    // This method has side effects as it mutate the item object
    async getItem(item) {
        try {
            const { chefId, mealId, quantity, sizeId, addons: itemAddons } = item;

            // Check if meal is found
            const meal = await this.mealFindService.findMealById(chefId, mealId);
            if (!meal) {
                return null;
            }
            item.meal = meal;

            // check if quantity in accepted range
            if (quantity <= 0) {
                return null;
            }
            // Check size 
            const size = this.mealFindService.getSizeInMeal(sizeId, meal);
            if (!size) {
                return null;
            }
            item.size = size;

            const mealPrice = size.price * quantity;

            // cal addons price
            const addonsItems = [];
            const addOnsPrice = itemAddons.reduce((sum, itemAddon) => {
                const addon = this.mealFindService.getAddOnInMeal(itemAddon.id, meal);
                if (addon) {
                    addonsItems.push({ addon, quantity: itemAddon.quantity });
                    return sum + (addon.price * itemAddon.quantity);
                }
                return sum;
            }, 0);
            item.addonsItems = addonsItems;
            item.value = ValidateService.roundFloat(mealPrice + addOnsPrice);

            return item;
        } catch (error) {
            throw error;
        }
    }

}