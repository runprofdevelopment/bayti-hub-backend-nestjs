const ChefFindService = require('../chef/chefFindService');
const SubCollectionRepository = require('../../database/subCollectionRepository');
const CategoryFindService = require('../category/categoryFindService');

module.exports = class MealFindService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.mealsRepository = new SubCollectionRepository("chefs", "meals");
        this.categoryFindService = new CategoryFindService(this.currentUser, this.language);
    }

    async findMealById(chefId, mealId) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            const meal = await this.mealsRepository.findDocumentById(chef.id, mealId);
            if (!meal || meal.isRemoved) {
                return null;
            }
            const category = await this.categoryFindService.findCategoryById(meal.categoryId);
            const section = this.findSectionById(chef, meal.sectionId);
            meal.category = category;
            meal.section = section;
            return meal;
        } catch (error) {
            throw error;
        }
    }

    async listChefMealsById(chefId, filter, pagination) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            return await this.listChefMeals(chef, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listChefMealsByAuthId(authId, filter, pagination) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.listChefMeals(chef, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listMealsByFilter(chefId, filter) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            return await this.listChefMeals(chef, filter, undefined);
        } catch (error) {
            throw error;
        }
    }

    async listAllChefMeals(chef) {
        try {
            return await this.listChefMeals(chef, [], undefined);
        } catch (error) {
            throw error;
        }
    }

    async listChefMeals(chef, filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'isRemoved', operator: '==', value: false },
            ]
            const meals = await this.mealsRepository.listDocuments(chef.id, appendedFilter, pagination);
            for (const meal of meals) {
                const category = await this.categoryFindService.findCategoryById(meal.categoryId);
                const section = await this.findSectionById(chef, meal.sectionId);
                meal.category = category;
                meal.section = section;
            }

            return meals;
        } catch (error) {
            throw error;
        }
    }

    isAddOnFoundInMeal(addOnId, meal) {
        try {
            const addons = meal.addons;
            for (const addOn of addons) {
                if (addOnId === addOn.id) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            throw error;
        }
    }

    getAddOnInMeal(addOnId, meal) {
        try {
            const addons = meal.addons;
            for (const addOn of addons) {
                if (addOnId === addOn.id) {
                    return addOn;
                }
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    getSizeInMeal(sizeId, meal) {
        try {
            const sizes = meal.sizes;
            for (const size of sizes) {
                if (size.id === sizeId) {
                    return size;
                }
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    findSectionById(chef, sectionId) {
        try {
            if (!chef) {
                return null;
            }
            const sections = chef.sections;
            console.log("sections",sections);
            for (const section of sections) {
                if (sectionId === section.id) {
                    return section;
                }
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

}