const admin = require('firebase-admin');
const { isFunction } = require('lodash');
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class ClientRepository {
    constructor() {
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
        this.collectionName = 'admins';
    }

    async setAdmin(admin) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, admin)
        } catch (error) {
            throw error
        }
    }

    async findAdminById(adminId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById(this.collectionName, adminId)
        } catch (error) {
            throw error
        }
    }

    async getAdminByEmail(email) {
        try {
            const filter = [
                {key: 'email', value: email, operator: '=='},
                {key: 'isRemoved', value: false, operator: '=='}
            ]
            const admins = await this.firestoreRepositroyHelper.getDocumentsByFilter(this.collectionName, filter)
            if(admins.length > 0){
                return admins[0]
            }
            
            return null
        } catch (error) {
            throw error
        }
    }

    async editAdmin(adminId, adminUpdate) {
        try {
            return await this.firestoreRepositroyHelper
                .updateDocument(this.collectionName, adminId, adminUpdate)
        } catch (error) {
            throw error
        }
    }

    async setAdminsStatus(adminsIds, status) {
        try {
            const batch = admin.firestore().batch()
            adminsIds.forEach(adminId => {
                const clientRef = admin.firestore().collection(this.collectionName).doc(adminId);
                batch.update(clientRef, { status });
            });
            await batch.commit()

            return true
        } catch (error) {
            throw error
        }
    }

    async getAdmins(filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'isRemoved', value: false, operator: '==' }
            ]
            return await this.firestoreRepositroyHelper.getDocumentsByFilterAndPagination(this.collectionName,
                appendedFilter, pagination)
        } catch (error) {
            throw error
        }
    }

    async setAdminAccess(adminId, pagesAccess) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument
                (this.collectionName, adminId, { pagesAccess })
        } catch (error) {
            throw error
        }
    }

}