const ChefRepository = require('../../database/chefRepository');
const ChefFindService = require('./chefFindService');
const ChefEditService = require('./chefEditService');
const AlgoliaService = require('../algoliaService');
const MealRemoveService = require('../meal/mealRemoveService');
const CategoryFindService = require('../category/categoryFindService');
const CustomError = require('../../error/customeError');

module.exports = class ChefKitchenService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefRepository = new ChefRepository();
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefEditService = new ChefEditService(this.currentUser, this.language);
        this.algoliaService = new AlgoliaService();
        this.mealRemoveService = new MealRemoveService(this.currentUser, this.language);
        this.categoryFindService = new CategoryFindService(null, this.currentUser, this.language);
    }

    async setChefKitchenByAuth(authId, kitchen) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.setChefKitchen(chef, kitchen);
        } catch (error) {
            throw error;
        }
    }

    async setChefKitchenByChefId(chefId, kitchen) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
            return await this.setChefKitchen(chef, kitchen);
        } catch (error) {
            throw error;
        }
    }

    async setChefKitchen(chef, kitchen) {
        try {
            if (!chef.address) {
                throw new CustomError(this.language, 'chef.error.addressNotFound');
            }

            const promises = kitchen.categoriesIds.map(categoryId => this.categoryFindService.findCategoryById(categoryId));
            const categories = await Promise.all(promises);
            categories.forEach(category => {
                if (!category) {
                    throw new CustomError(this.language, 'category.error.categoryNotFound');
                }
            })

            // add kitchen to chef 
            await this.chefEditService.editChef(chef, { kitchen });
            // add chef to algolia
            const updatedChef = await this.chefFindService.findChefById(chef.id);
            await this.algoliaService.pushChefToAlgolia(updatedChef);

            return true;
        } catch (error) {
            throw error;
        }
    }

    async setSectionsByChefId(chefId, sections) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);
          
            return await this.setSections(chef, sections);
        } catch (error) {
            throw error;
        }
    }

    async setSectionsByAuthId(authId, sections) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.setSections(chef, sections);
        } catch (error) {
            throw error;
        }
    }

    async setSections(chef, sections) {
        try {
            // compre old sections and get removed ones
            const oldSections = chef.sections;
            const sectionsMap = new Map();
            for (const section of oldSections) {
                sectionsMap.set(section.id, section);
            }

            for (const section of sections) {
                sectionsMap.delete(section.id);
            }
            const toBeRemovedSections = sectionsMap.values();
            for (const section of toBeRemovedSections) {
                await this.mealRemoveService.removeSectionMeals(chef.id, section.id);
            }

            // set sections to chef 
            await this.chefEditService.editChef(chef, { sections });
            // add chef to algolia
            const updatedChef = await this.chefFindService.findChefById(chef.id);
            await this.algoliaService.pushChefToAlgolia(updatedChef);

            return true;
        } catch (error) {
            throw error;
        }
    }

    async findSectionById(chef, sectionId) {
        try {
            if (!chef) {
                return null;
            }
            const sections = chef.sections;
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