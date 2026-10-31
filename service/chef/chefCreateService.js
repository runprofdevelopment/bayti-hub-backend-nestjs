const admin = require('firebase-admin');
const CustomError = require('../../error/customeError');
const ChefRepository = require('../../database/chefRepository');
const ChefFindService = require('./chefFindService');
const ChefWalletService = require('./chefWalletService');
const ChefNotificationService = require('./chefNotificationService');
const VariablesService = require('../variablesService');
const ValidateService = require('../validateService');
const { i18n } = require('../../i18n');

module.exports = class ChefCreateService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefRepository = new ChefRepository();
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefWalletService = new ChefWalletService(this.currentUser, this.language);
        this.chefNotificationService = new ChefNotificationService(this.currentUser, this.language);
        this.variablesService = new VariablesService(this.currentUser, this.language, "variables");
        this.statsService = new VariablesService(this.currentUser, this.language, "stats");
    }

    async createChef(data) {
        try {
            const uid = this.currentUser.uid;
            const email = data.email;
            const phoneNumber = data.phoneNumber;

            const chefFoundByAuthUid = await this.chefFindService.isChefFoundByAuthId(uid);

            if (chefFoundByAuthUid) {
                throw new CustomError(this.language, 'chef.error.chefExists');
            }

            // valdiate email and phone number
            if (email) {
                ValidateService.validateEmail(email);
            }
            ValidateService.validatePhoneNumber(phoneNumber);

            const id = admin.firestore().collection(`ids`).doc().id;

            // generate chef code and increment it
            const code = await this.variablesService.getVariable("chefCode");
            await this.variablesService.setVariable("chefCode", code + 1);

            const chef = {
                id,
                code: `C${code}`,
                authenticationUid: uid,
                notification: true,
                isRemoved: false,
                isEnabled: true,
                address: null,
                kitchen: null,
                sections: [],
                categories: [],
                closedOrdersCount: 0,
                cancelledOrdersCount: 0,
                rating: 0,
                reviewsCount: 0,
                promoted: false,
                ...data,
                createdBy: id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }
            const curretnDeviceToken = data.deviceToken;
            chef.deviceTokens = [curretnDeviceToken];
            delete chef.deviceToken;

            // Add user to the firestore
            await this.chefRepository.setChef(chef);
            // Create empty wallet for the chef
            await this.chefWalletService.creatEmptyWalletForChef(chef);
            // Subscribe chef to the 'all' topic notificaction
            await this.chefNotificationService.subscribeChef(chef);

            // update stats aggregation for new users
            await this.statsService.incrementVariable("chefsCount");

            // notify Chef
            await this.notifyChef(chef);

            const createdChef = await this.chefFindService.findChefByIdNotRemoved(chef.id);

            return createdChef;
        } catch (error) {
            throw error;
        }
    }

    async notifyChef(chef) {
        try {
            const chefId = chef.id;
            const title = {
                en: i18n('en', 'chef.notification.welcome'),
                ar: i18n('ar', 'chef.notification.welcome')
            }
            const body = {
                en: i18n('en', 'chef.notification.welcome'),
                ar: i18n('ar', 'chef.notification.welcome')
            }
            const data = {
                key: 'newChef',
                value: `${chefId}`
            }

            await this.chefNotificationService.notifyChef(chefId, title, body, data);
        } catch (error) {
            throw error;
        }
    }

}