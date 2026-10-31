const admin = require('firebase-admin');
const ChefRepository = require('../../database/chefRepository');
const ChefFindService = require('./chefFindService');
const ChefNotificationService = require('./chefNotificationService');
const AlgoliaService = require('../algoliaService');
const ValidateService = require('../validateService');

module.exports = class ChefEditService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefRepository = new ChefRepository();
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefNotificationService = new ChefNotificationService(this.currentUser, this.language);
        this.algoliaService = new AlgoliaService();
    }

    async editChefByUid(authId, chefUpdate) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.editChef(chef, chefUpdate);
        } catch (error) {
            throw error;
        }
    }

    async editChefById(chefId, chefUpdate) {
        try {
            const chef = await this.chefFindService.findChefByIdNotRemoved(chefId);
            return await this.editChef(chef, chefUpdate);
        } catch (error) {
            throw error;
        }
    }

    async editChef(chef, chefUpdate) {
        try {
            const email = chefUpdate.email;
            const phoneNumber = chefUpdate.phoneNumber;
            if (email) {
                ValidateService.validateEmail(email);
            }
            if (phoneNumber) {
                ValidateService.validatePhoneNumber(phoneNumber);
            }
            // update notification subscribtion when change language
            if (chefUpdate.lang) {
                chef.lang = chefUpdate.lang;
                await this.chefNotificationService.subscribeChef(chef);
            }

            const updateObject = {
                ...chefUpdate,
                updatedAt: new Date(),
                updatedBy: chef.id
            }   
            await this.chefRepository.editChef(chef.id, updateObject);

            const updatedChef = await this.chefFindService.findChefById(chef.id);
            await this.algoliaService.pushChefToAlgolia(updatedChef);

            return updatedChef;
        } catch (error) {
            throw error;
        }
    }

    async setMyNotificationStatusByUid(authId, notificationStatus) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            // subscribe/unsubcribe this user from notifications
            if (notificationStatus === true) {
                await this.chefNotificationService.subscribeChef(chef);
            } else {
                await this.chefNotificationService.unSubscribeChef(chef);
            }

            return await this.chefRepository.editChef(chef.id, { notification: notificationStatus });
        } catch (error) {
            throw error
        }
    }

    async setChefsStatus(chefsIds, status) {
        try {

            for (const chefId of chefsIds) {
                const chef = await this.chefFindService.findChefByIdNotRemoved(chefId);
                await this.editChef(chef, { isEnabled: status });

                const updatedChef = await this.chefFindService.findChefById(chefId);
                // Add or remove chef from algolia
                if (status) {
                    await this.algoliaService.pushChefToAlgolia(updatedChef);
                } else {
                    await this.algoliaService.removeChefFromAlgolia(updatedChef);
                }
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

}