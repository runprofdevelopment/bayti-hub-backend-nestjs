const admin = require('firebase-admin');
const CustomError = require('../../error/customeError');
const ClientRepository = require('../../database/clientRepository');
const ClientFindService = require('./clientFindService');
const ClientWalletService = require('./clientWalletService');
const ClientNotificationService = require('../../service/client/clientNotificationService');
const CartCreateService = require('../cart/cartCreateService');
const VariablesService = require('../variablesService');
const ValidateService = require('../validateService');
const { i18n } = require('../../i18n');

module.exports = class ClientCreateService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.clientRepository = new ClientRepository();
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.clientNotificationService = new ClientNotificationService(this.currentUser, this.language);
        this.clientWalletService = new ClientWalletService(this.currentUser, this.language);
        this.cartCreateService = new CartCreateService(this.currentUser, this.language);
        this.variablesService = new VariablesService(this.currentUser, this.language, "variables");
        this.statsService = new VariablesService(this.currentUser, this.language, "stats");
    }

    async createClient(data) {
        try {
            const uid = this.currentUser.uid;
            const email = data.email;
            const phoneNumber = data.phoneNumber;

            const clientFoundByAuthUid = await this.clientFindService.isClientFoundByAuthId(uid);

            if (clientFoundByAuthUid) {
                throw new CustomError(this.language, 'client.error.clientExists')
            }

            if (email) {
                ValidateService.validateEmail(email);
            }
            ValidateService.validatePhoneNumber(phoneNumber);

            const id = admin.firestore().collection(`ids`).doc().id;
            // generate chef code and increment it
            const code = await this.variablesService.getVariable("clientCode");
            await this.variablesService.setVariable("clientCode", code + 1);

            const client = {
                id,
                code: `U${code}`,
                authenticationUid: uid,
                isEnabled: true,
                notification: true,
                isRemoved: false,
                closedOrdersCount: 0,
                cancelledOrdersCount: 0,
                favouriteChefs: [],
                ...data,
                createdBy: id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }
            const curretnDeviceToken = data.deviceToken;
            client.deviceTokens = [curretnDeviceToken];
            delete client.deviceToken;

            // Add user to the firestore
            await this.clientRepository.setClient(client);
            //Create empty wallet for the client
            await this.clientWalletService.creatEmptyWalletForClient(client);
            // Subscribe client to the 'all' topic notificaction
            await this.clientNotificationService.subscribeClient(client);

            // Create empty cart for the client
            await this.cartCreateService.createEmptyCartForClient(client);

            // update stats aggregation for new users
            await this.statsService.incrementVariable("clientsCount");

            const createdClient = await this.clientFindService.findClientByIdNotRemoved(client.id);

            return createdClient;
        } catch (error) {
            throw error
        }
    }

    async notifyClient(client) {
        try {
            const clientId = client.id;
            const title = {
                en: i18n('en', 'client.notification.welcome'),
                ar: i18n('ar', 'client.notification.welcome')
            }
            const body = {
                en: i18n('en', 'client.notification.welcome'),
                ar: i18n('ar', 'client.notification.welcome')
            }
            const data = {
                key: 'newClient',
                value: `${clientId}`
            }

            await this.clientNotificationService.notifyClient(clientId, title, body, data);
        } catch (error) {
            throw error;
        }
    }

}