const admin = require('firebase-admin')
const FirebaseRepository = require('./utils/firebaseRepository')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class CategoryRepository {
    constructor() {
        this.collectionName = 'categories'
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
    }

    async setCategory(category) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, category)
        } catch (error) {
            throw error
        }
    }

    async removeCategory(categoryId) {
        try {
            await admin.firestore().collection('categories').doc(categoryId).delete()

            return true
        } catch (error) {
            throw error
        }
    }

    async editCategory(categoryId, updateObject) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, categoryId, updateObject)
        } catch (error) {
            throw error
        }
    }

    async getCategoryById(categoryId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById(this.collectionName, categoryId)
        } catch (error) {
            throw error
        }
    }

    async getCategories(filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'isRemoved', value: false, operator: '==' }
            ]
            return await this.firestoreRepositroyHelper.getDocumentsByFilterAndPagination
                (this.collectionName, appendedFilter, pagination)
        } catch (error) {
            throw error
        }
    }



}