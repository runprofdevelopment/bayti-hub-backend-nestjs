const validator = require('validator');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const CustomError = require('../../error/customeError');
const ClientNotificationService = require('./clientNotificationService');
const ClientRepository = require('../../database/clientRepository');
const ClientFindService = require('../../service/client/clientFindService');
const ValidateService = require('../validateService');

module.exports = class ClientEditService {
    constructor(currentUser, language) {
        this.currentUser = currentUser
        this.language = language
        this.clientRepository = new ClientRepository()
        this.clientNotificationService = new ClientNotificationService(this.currentUser, this.language);
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
    }

    async editClientByAuthId(authId, clientUpdate) {
        const client = await this.clientFindService.findClientByAuthId(authId);
        return await this.editClient(client, clientUpdate);
    }

    async editClientById(clientId, clientUpdate) {
        const client = await this.clientFindService.findClientById(clientId);
        return await this.editClient(client, clientUpdate);

    }

    async editClient(client, clientUpdate) {
        try {
            const email = clientUpdate.email
            const phoneNumber = clientUpdate.phoneNumber
            if (email) {
                ValidateService.validateEmail(email);
            }

            if (phoneNumber) {
                ValidateService.validatePhoneNumber(phoneNumber);
            }

            // update notification subscribtion when change language
            if (clientUpdate.lang) {
                client.lang = clientUpdate.lang;
                await this.clientNotificationService.subscribeClient(client);
            }
            const updateObject = {
                ...clientUpdate,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: client.id
            }
            await this.clientRepository.editClient(client.id, updateObject);

            return await this.clientFindService.findClientById(client.id);
        } catch (error) {
            throw error
        }
    }

    async setNotificationStatusByUid(authId, notificationStatus) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            // subscribe/unsubcribe this user from notifications
            if (notificationStatus === true) {
                await this.clientNotificationService.subscribeClient(client);
            } else {
                await this.clientNotificationService.unSubscribeClient(client);
            }

            return await this.clientRepository.editClient(client.id, { notification: notificationStatus })
        } catch (error) {
            throw error
        }
    }

    async setClientsStatus(clientsIds, status) {
        try {
            // Enable/ disable in firebase
            for (const clientId of clientsIds) {
                const client = await this.clientFindService.findClientById(clientId);
                await this.editClient(client, { isEnabled: status });
            }

            return true
        } catch (error) {
            throw error
        }
    }

}