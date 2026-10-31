const { getAuth } = require('firebase-admin/auth');
const ClientEditService = require('./clientEditService');
const ClientFindService = require('./clientFindService');
const OrderFindService = require('../order/orderFindService');
const CustomError = require('../../error/customeError');

module.exports = class UserRemoveService {
    constructor(currentUser, language) {
        this.currentUser = currentUser
        this.language = language
        this.clientEditService = new ClientEditService(this.currentUser, this.language);
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
    }

    async removeClients(clientsIds) {
        try {
            for (const clientId of clientsIds) {
                const client = await this.clientFindService.findClientById(clientId);
                await this.removeClient(client);
            }

            return true
        } catch (error) {
            throw error
        }
    }

    async removeClientByAuthId(authId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);

            return await this.removeClient(client);
        } catch (error) {
            throw error
        }

    }

    async removeClient(client) {
        try {
            // if client has current orders, cannot be removed
            // check if chef has current orders, cannot be removed
            const orderFilter = [
                { key: 'status', values: ["inProgress", "delivering"], operator: "in" },
                { key: 'clientId', value: client.id, operator: "==" }
            ]
            const orders = await this.orderFindService.listOrders(orderFilter, undefined);
            if (orders.length > 0) {
                throw new CustomError(this.language, 'client.error.clientHasOrders');
            }
            // update status
            await this.clientEditService.editClient(client, { isRemoved: true });

            return true;
        } catch (error) {
            throw error;
        }
    }
}