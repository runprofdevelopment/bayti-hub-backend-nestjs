const admin = require('firebase-admin');
const CollectionRepository = require('../../database/collectionRepository');
const { pagination } = require('../../i18n/en');
const CategoryFindService = require('./categoryFindService');

module.exports = class CategoryService {
    constructor(user, currentUser, language) {
        this.user = user;
        this.currentUser = currentUser;
        this.language = language;
        this.categoryRepository = new CollectionRepository("categories");
        this.categoryFindService = new CategoryFindService(this.user, this.currentUser, this.language);
    }

    async createCategory(name) {
        try {
            const uid = this.currentUser.uid
            const categories = await this.categoryFindService.listCategories([], null);

            const category = {
                id: admin.firestore().collection(`ids`)
                .doc().id,
                name,
                order: categories.length,
                isRemoved: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: uid,
                updatedBy: uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            const res = await this.categoryRepository.setDocument(category);

            return res;
        } catch (error) {
            throw error
        }
    }
}