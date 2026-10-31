const ClientRepository = require('../../database/clientRepository');
const CustomError = require('../../error/customeError');

module.exports = class ClientFindService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.clientRepository = new ClientRepository();
    }

    async findClientByAuthId(authId) {
        try {
            const filter = [
                { key: 'authenticationUid', operator: '==', value: authId },
                { key: 'isRemoved', operator: '==', value: false },
            ]
            const pagination = {
                action: "next",
                firstPage: true,
                limit: 10,
                orderBy: "createdBy",
                sortType: "asc"
            }

            const clients = await this.listClients(filter, pagination);

            if (clients.length === 0) {
                throw new CustomError(this.language, 'client.error.clientNotFound');
            }

            const defaultAddress = await this.clientRepository.getDefaultAddressOfClient(clients[0].id);
            clients[0].defaultAddress = defaultAddress;

            return clients[0];
        } catch (error) {
            throw error;
        }
    }

    async findClientByIdNotRemoved(clientId) {
        try {
            const client = await this.findClientById(clientId);
            if (!client || client.isRemoved) {
                throw new CustomError(this.language, 'client.error.clientNotFound')
            }

            return client;
        } catch (error) {
            throw error;
        }
    }

    async findClientById(clientId) {
        try {
            const client = await this.clientRepository.findClientById(clientId);
            if (!client) {
                return null;
            }
            const defaultAddress = await this.clientRepository.getDefaultAddressOfClient(client.id);
            client.defaultAddress = defaultAddress;

            return client;
        } catch (error) {
            throw error;
        }
    }

    async isClientFoundByAuthId(authId) {
        try {
            const client = await this.findClientByAuthId(authId);
            return client !== null;
        } catch (error) {
            return false;
        }
    }

    async listClients(filter, pagination) {
        try {
            return await this.clientRepository.getClients(filter, pagination);
        } catch (error) {
            throw error
        }
    }

    async listClientsNotRemoved(filter, pagination) {
        try {
            const appendedFilters = [
                { key: 'isRemoved', operator: '==', value: false },
                ...filter
            ]
            return await this.listClients(appendedFilters, pagination);
        } catch (error) {
            throw error
        }
    }

}