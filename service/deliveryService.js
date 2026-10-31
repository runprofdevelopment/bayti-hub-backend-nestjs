const admin = require('firebase-admin')
const DeliveryRepository = require('../database/deliveryRepository')

module.exports = class DeliveryService {
    constructor(user, currentUser, language) {
        this.user = user
        this.currentUser = currentUser
        this.language = language
        this.deliveryRepository = new DeliveryRepository()
    }

    async addDeliveryCompany(deliveryCompanyInput) {
        try {
            const deliveryCompany = {
                id: admin.firestore().collection(`ids`)
                    .doc().id,
                ...deliveryCompanyInput,
                createdBy: this.currentUser.uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }
            await this.deliveryRepository.addDeliveryCompany(deliveryCompany)

            return deliveryCompany
        } catch (error) {
            throw error
        }
    }

    async removeDeliveryCompany(deliveryCompanyId) {
        try {
            await this.deliveryRepository.removeDeliveryCompany(deliveryCompanyId)

            return true
        } catch (error) {
            throw error
        }
    }

    async setDeliveryCompanyLogo(deliveryCompanyId, logo) {
        try {
            await this.deliveryRepository.setDeliveryCompanyLogo(deliveryCompanyId, logo)

            return true
        } catch (error) {
            throw error
        }
    }

    async getDeliveryCompanies() {
        try {
            const deliveryCompanies = await this.deliveryRepository.getDeliveryCompanies()

            return deliveryCompanies
        } catch (error) {
            throw error
        }
    }

    async getDeliveryCompaniesByIds(deliveryCompaniesIds) {
        try {
            const deliveryCompanies = []
            for (const deliveryCompanyId of deliveryCompaniesIds) {
                const deliveryCompany = await this.deliveryRepository.getDeliveryCompanyById
                    (deliveryCompanyId)
                if (deliveryCompany && deliveryCompany !== null) {
                    deliveryCompanies.push(deliveryCompany)
                }
            }
            return deliveryCompanies
        } catch (error) {
            throw error
        }
    }

    async getDeliveryCompanyById(deliveryCompanyId) {
        try {
           return await this.deliveryRepository.getDeliveryCompanyById(deliveryCompanyId)
        } catch (error) {
            throw error
        }
    }
}