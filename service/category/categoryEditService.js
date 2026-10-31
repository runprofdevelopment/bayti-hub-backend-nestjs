const admin = require('firebase-admin');
const CollectionRepository = require('../../database/collectionRepository');
const CateogoryFindService = require('./categoryFindService');

module.exports = class CategoryEditService {
    constructor(user, currentUser, language) {
        this.user = user;
        this.currentUser = currentUser;
        this.language = language;
        this.categoryRepository = new CollectionRepository("categories");
        this.cateogoryFindService = new CateogoryFindService(this.user, this.currentUser, this.language);
    }

    async editCategory(categoryId, categoryUpdate){
        try{
            const category = await this.cateogoryFindService.findCategoryById(categoryId);

            return await this.categoryRepository.editDocument(categoryId, categoryUpdate);
        }catch(error){
            throw error;
        }
    }

    async arrangeCategories(categoriesIds) {
        try {
            let order = 0;
            for (const categoryId of categoriesIds) {
                await this.editCategory(categoryId, { order });
                order = order + 1;
            }
            
            return true;
        } catch (error) {
            throw error;
        }
    }
}