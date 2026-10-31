
const functions = require("firebase-functions");
const algoliasearch = require('algoliasearch');
const MealFindService = require('../service/meal/mealFindService');
const {constants} = require("../config/config");

// Set Algolia Key 
const algoliaAdminKey = constants.algoliaAdminKey;
const algoliaAppId = constants.algoliaAppId;

module.exports = class AlgoliaService {
    constructor() {
        this.indexName = constants.indexName;
        this.mealFindService = new MealFindService();
    }

    async pushChefToAlgolia(chef) {
        try {
            if (!chef.address || !chef.kitchen || !chef.sections) {
                return await this.removeChefFromAlgolia(chef);
            }
            const chefMeals = await this.mealFindService.listAllChefMeals(chef);
            // check if the chef doesn't have any meals
            if (chefMeals.length === 0) {
                return await this.removeChefFromAlgolia(chef);
            }
            // add meals to the chef
            chef.meals = chefMeals;

            const client = algoliasearch(algoliaAppId, algoliaAdminKey);
            const index = client.initIndex(this.indexName);
            const res = await index.saveObject({
                ...chef,
                objectID: chef.id,
                _geoloc: {
                    lat: chef.address.lat,
                    lng: chef.address.long,
                }
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    async removeChefFromAlgolia(chefId) {
        try {
            const client = algoliasearch(algoliaAppId, algoliaAdminKey);
            const index = client.initIndex(this.indexName);
            await index.deleteObject(chefId.id);

            return true;
        } catch (error) {
            throw error;
        }
    }
}
