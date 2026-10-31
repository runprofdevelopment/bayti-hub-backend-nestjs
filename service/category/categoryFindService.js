const admin = require('firebase-admin');
const CollectionRepository = require('../../database/collectionRepository');
const CustomError = require('../../error/customeError');

module.exports = class CategoryService {
    constructor(user, currentUser, language) {
        this.user = user;
        this.currentUser = currentUser;
        this.language = language;
        this.categoryRepository = new CollectionRepository("categories");
    }

    async findCategoryById(categoryId) {
        try {
            const category = await this.categoryRepository.findDocumentById(categoryId);
            if (!category || category.isRemoved) {
                return null;
            }
            return category;
            
        } catch (error) {
            throw error;
        }
    }

    async listCategories(filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: "isRemoved", operator: "==", value: false}
            ];
            return await this.categoryRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listAllCategories() {
        try {
            const filter = [
                { key: "isRemoved", operator: "==", value: false}
            ];
            return await this.categoryRepository.listDocuments(filter, {
                action: "next", firstPage: true, orderBy: "order", sortType: "asc",
                limit: 500
            });
        } catch (error) {
            throw error;
        }
    }
}