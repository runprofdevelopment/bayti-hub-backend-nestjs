const admin = require('firebase-admin');
const ChefFindService = require('./chefFindService');
const ChefEditService = require('./chefEditService');
const ChefNotificationService = require('./chefNotificationService');

module.exports = class ChefAuthService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefNotificationService = new ChefNotificationService(this.currentUser, this.language);
        this.chefEditService = new ChefEditService(this.currentUser, this.language);
    }

    async login(authId, deviceToken) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);

            await this.chefEditService.editChef(chef, {
                deviceTokens: admin.firestore.FieldValue.arrayUnion(deviceToken)
            });

            const updatedChef = await this.chefFindService.findChefByAuthId(authId);

            await this.chefNotificationService.subscribeChef(updatedChef);

            return updatedChef;
        } catch (error) {
            throw error
        }
    }

    async logout(authId, deviceToken) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);

            await this.chefNotificationService.unSubscribeChef(chef);
            await this.chefEditService.editChef(chef, {
                deviceTokens: admin.firestore.FieldValue.arrayRemove(deviceToken)
            });
            const updatedChef = await this.chefFindService.findChefByAuthId(authId);
            await this.chefNotificationService.subscribeChef(updatedChef);

            return updatedChef;
        } catch (error) {
            throw error
        }
    }
}