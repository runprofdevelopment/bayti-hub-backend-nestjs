const admin = require('firebase-admin');
const CollectionRepository = require('../database/collectionRepository');

module.exports = class SliderService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.sliderRepository = new CollectionRepository("sliders");
    }

    async addSlider(sliderInput) {
        try {
            const uid = this.currentUser.uid;

            const slider = {
                ...sliderInput,
                createdBy: uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            return await this.sliderRepository.setDocument(slider);
        } catch (error) {
            throw error
        }
    }

    async getSliders() {
        try {
            const pagiantion = {
                firstPage: true,
                limit: 100,
                orderBy: "createdAt",
                sortType: "desc",
                action: "next"
            }
            const sliders = await this.sliderRepository.listDocuments([], pagiantion);

            return sliders;
        } catch (error) {
            throw error;
        }
    }

    async removeSlider(sliderId) {
        try {
            return await this.sliderRepository.removeDocument(sliderId);
        } catch (error) {
            throw error
        }
    }

    async findSliderById(sliderId) {
        try {
            return await this.sliderRepository.findDocumentById(sliderId);
        } catch (error) {
            throw error
        }
    }

    async updateSlider(sliderId, sliderUpdate) {
        try {
            return this.sliderRepository.editDocument(sliderId, sliderUpdate);
        } catch (error) {
            throw error
        }
    }

}