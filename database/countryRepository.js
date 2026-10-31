const admin = require('firebase-admin')
const FirestoreRepositoryHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class CountryRepository {
    constructor() {
        this.collectionName = 'countries'
        this.firestoreRepositoryHelper = new FirestoreRepositoryHelper()
    }

    async getCountries() {
        try {
            return await this.firestoreRepositoryHelper.getDocumentsInCollection
                (this.collectionName)
        } catch (error) {
            throw error
        }
    }

    async getCountryCities(countryId) {
        try {
            return await this.firestoreRepositoryHelper.getDocumentsInSubCollection
                (this.collectionName, countryId, 'cities')
        } catch (error) {
            throw error
        }
    }

    async getCity(countryId, cityId) {
        try {
            return await this.firestoreRepositoryHelper.getDocumentInSubCollectionById
                (this.collectionName, countryId, 'cities', cityId)
        } catch (error) {
            throw error
        }
    }

}