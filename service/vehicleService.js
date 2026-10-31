const admin = require('firebase-admin');
const CollectionRepository = require('../database/collectionRepository');
const CustomError = require('../error/customeError');
const { pagination } = require('../i18n/en');

module.exports = class VehicleService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.vehicleRepository = new CollectionRepository("vehicles");
    }

    async createVehicle(vehicleInput) {
        try {
            const uid = this.currentUser.uid;

            const vehicle = {
                name: {
                    en: vehicleInput.en,
                    ar: vehicleInput.ar
                },
                id: admin.firestore().collection(`ids`).doc().id,
                createdBy: uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            return await this.vehicleRepository.setDocument(vehicle);
        } catch (error) {
            throw error;
        }
    }

    async listVehicles() {
        try {
            const pagiantion = {
                firstPage: true,
                limit: 100,
                orderBy: "createdAt",
                sortType: "asc",
                action: "next"
            }

            return await this.vehicleRepository.listDocuments([], pagiantion);
        } catch (error) {
            throw error;
        }
    }

    async removeVehicle(vehicleId) {
        try {
            return await this.vehicleRepository.removeDocument(vehicleId);
        } catch (error) {
            throw error;
        }
    }

    async findVehicleById(vehicleId) {
        try {
            const vehicle = await this.vehicleRepository.findDocumentById(vehicleId);
            if (!vehicle) {
                throw new CustomError(this.language, 'vehicle.error.vehicleNotFound');
            }
            return vehicle;
        } catch (error) {
            throw error;
        }
    }

}