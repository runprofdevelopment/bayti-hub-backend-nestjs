const validator = require('validator');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const CustomError = require('../../error/customeError');
const ClientEditService = require('./clientEditService');
const ClientFindService = require('./clientFindService');
const ClientNotificationService = require('./clientNotificationService');

module.exports = class ClientAuthService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.clientNotificationService = new ClientNotificationService(this.currentUser, this.language);
        this.clientEditService = new ClientEditService(this.currentUser, this.language);
    }

    async login(authId, deviceToken) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);

            await this.clientEditService.editClient(client, {
                deviceTokens: admin.firestore.FieldValue.arrayUnion(deviceToken)
            });

            const updatedClient = await this.clientFindService.findClientByAuthId(authId);

            await this.clientNotificationService.subscribeClient(updatedClient);

            return client;
        } catch (error) {
            throw error
        }
    }

    async logout(authId, deviceToken) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);

            await this.clientNotificationService.unSubscribeClient(client);
            await this.clientEditService.editClient(client, {
                deviceTokens: admin.firestore.FieldValue.arrayRemove(deviceToken)
            });

            const updatedClient = await this.clientFindService.findClientByAuthId(authId);
            await this.clientNotificationService.subscribeClient(updatedClient);

            return updatedClient;
        } catch (error) {
            throw error;
        }
    }
}