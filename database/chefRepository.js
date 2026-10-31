const admin = require('firebase-admin');
const { isFunction } = require('lodash');
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper');

module.exports = class ChefRepository {
    constructor() {
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper();
        this.collectionName = 'chefs';
    }

    async setChef(chef) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, chef);
        } catch (error) {
            throw error
        }
    }

    async findChefById(chefId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById(this.collectionName, chefId);
        } catch (error) {
            throw error
        }
    }

    async getChefs(filter, pagination) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsByFilterAndPagination
                (this.collectionName,
                    filter, pagination);
        } catch (error) {
            throw error
        }
    }

    async editChef(chefId, chefUpdate) {
        try {
            return await this.firestoreRepositroyHelper
                .updateDocument(this.collectionName, chefId, chefUpdate);
        } catch (error) {
            throw error
        }
    }

    // Notifications .................................

    async addNotificationToChef(chefId, notification) {
        const notificationObject = {
            ...notification,
            createdAt: new Date()
        }
        try {
            console.log(chefId);
            return await this.firestoreRepositroyHelper.setDocumentInSubCollection
                (this.collectionName, chefId, 'notifications', notificationObject);
        } catch (error) {
            throw error
        }
    }

    async findNotificationById(chefId, notificationId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentInSubCollectionById
                (this.collectionName, chefId, 'notifications', notificationId);
        } catch (error) {
            throw error
        }
    }

    async listChefNotifications(chefId, filter, pagination) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByFilterAndPagination
                (this.collectionName, chefId, 'notifications', filter, pagination);
        } catch (error) {
            throw error
        }
    }

    async updateNotification(chefId, notificationId, notificationUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocumentInSubCollection
                (this.collectionName, chefId, 'notifications', notificationId, notificationUpdate);
        } catch (error) {
            throw error;
        }
    }

    async removeNotification(chefId, notificationId) {
        try {
            return await this.firestoreRepositroyHelper.removeDocumentInSubCollection
                (this.collectionName, chefId, 'notifications', notificationId);
        } catch (error) {
            throw error;
        }
    }

    // Bank accounts................................................................
    async addBankAccount(chefId, bankAccount) {
        try {
            return await this.firestoreRepositroyHelper.setDocumentInSubCollection
                (this.collectionName, chefId, 'bankAccounts', bankAccount);
        } catch (error) {
            throw error
        }
    }

    async getDefaultBankAccountOfChef(chefId) {
        try {
            const defaults = await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByParamater
                (this.collectionName, chefId, 'bankAccounts', 'isDefault', true);
            if (defaults.length == 0) {
                return null
            }
            return defaults[0]
        } catch (error) {
            throw error
        }
    }

    async getBankAccountsOfChef(chefId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInSubCollectionByParamater
                (this.collectionName, chefId, 'bankAccounts', 'isRemoved', false);
        } catch (error) {
            throw error
        }
    }

    async getChefBankAccountById(chefId, bankAccountId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentInSubCollectionById
                (this.collectionName, chefId, 'bankAccounts', bankAccountId);
        } catch (error) {
            throw error
        }
    }

    async updateBankAccount(chefId, bankAccountId, bankAccountUpdate) {
        try {
            return await this.firestoreRepositroyHelper.updateDocumentInSubCollection
                (this.collectionName, chefId, 'bankAccounts', bankAccountId, bankAccountUpdate);
        } catch (error) {
            throw error
        }
    }
    //..........................................................................................
}