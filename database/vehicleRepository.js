const admin = require('firebase-admin')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')


module.exports = class VehicleRepository {
    constructor() {
        this.collectionName = 'vehicles'
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
    }

    async setVehicle(vehicle) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, vehicle)
        } catch (error) {
            throw error
        }
    }

    async listVehicles() {
        try {
            return await this.firestoreRepositroyHelper.getDocumentsInCollection(this.collectionName)
        } catch (error) {
            throw error
        }

    }

    async removeVehicle(vehicleId) {
        try {
            return await this.firestoreRepositroyHelper.removeDocument(this.collectionName, vehicleId)
        } catch (error) {
            throw error
        }
    }

    async getVehicleById(vehicleId) {
        try {
            return this.firestoreRepositroyHelper.getDocumentById(this.collectionName, vehicleId)
        } catch (error) {
            throw error
        }
    }
}