const admin = require('firebase-admin')
const CategoryFindService = require('./categoryFindService');
const CategoryEditService = require('./categoryEditService');

module.exports = class CategoryRemoveService {
    constructor(user, currentUser, language) {
        this.user = user;
        this.currentUser = currentUser;
        this.language = language;
        this.categoryFindService = new CategoryFindService(this.user, this.currentUser, this.language);
        this.categoryEditService = new CategoryEditService(this.user, this.currentUser, this.language);
    }

    async removeCategory(categoryId) {
        try {
            const category = await this.categoryFindService.findCategoryById(categoryId);

            return await this.categoryEditService.editCategory(categoryId, { isRemoved: true });
        } catch (error) {
            throw error
        }
    }

}