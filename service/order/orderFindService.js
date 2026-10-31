const CollectionRepository = require('../../database/collectionRepository');
const ClientFindService = require('../client/clientFindService');
const ChefFindService = require('../chef/chefFindService');
const CaptainFindService = require('../captain/captainFindService');
const CustomError = require('../../error/customeError');

module.exports = class OrderFindService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.orderRepository = new CollectionRepository("orders");
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
    }

    async listOrders(filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                { key: 'status', value: ['inProgress', 'delivering', 'closed', 'cancelled'], operator: 'in' }
            ]
            return await this.orderRepository.listDocuments(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async findOrderById(orderId) {
        try {
            const order = await this.orderRepository.findDocumentById(orderId);
            if (!order) {
                throw new CustomError(this.language, 'order.error.orderNotFound');
            }

            return order;
        } catch (error) {
            throw error;
        }
    }

    async listClientOrdersByAuthId(authId, filter, pagination) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            return await this.listClientOrdersByClientId(client.id, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listClientOrdersByClientId(clientId, filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                {
                    key: 'clientId', value: clientId, operator: '=='
                },
            ]
            return await this.listOrders(appendedFilter, pagination);
        } catch (error) {
            throw error
        }
    }

    async calculateUserSalesInPeriod(userType, userId, startTime, endTime) {
        const orders = await this.listOrders([
            { key: `${userType}Id`, value: userId, operator: "==" },
            { key: "status", value: "closed", operator: "==" },
            { key: "deliveryTime", value: startTime, operator: ">=" },
            { key: "deliveryTime", value: endTime, operator: "<=" },
        ], null);

        let clientAmount = 0, chefAmount = 0, captainAmount = 0;
        for (const order of orders) {
            clientAmount += order.totalAmount;
            chefAmount += order.chefProfit;
            captainAmount += order.captainProfit;
        }

        return { clientAmount, chefAmount, captainAmount };
    }

    async listChefOrdersByAuthId(authId, filter, pagination) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authId);
            return await this.listChefOrdersByChefId(chef.id, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listChefOrdersByChefId(chefId, filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                {
                    key: 'chefId', value: chefId, operator: '=='
                },
            ]
            return await this.listOrders(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listCaptainOrdersByAuthId(authId, filter, pagination) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            return await this.listCaptainOrdersByCaptainId(captain.id, filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listCaptainOrdersByCaptainId(captainId, filter, pagination) {
        try {
            const appendedFilter = [
                ...filter,
                {
                    key: 'captainId', value: captainId, operator: '=='
                },
            ]
            return await this.listOrders(appendedFilter, pagination);
        } catch (error) {
            throw error;
        }
    }

}