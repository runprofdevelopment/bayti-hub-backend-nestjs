const admin = require('firebase-admin');
const ClientRepository = require('../../database/clientRepository');
const CustomError = require('../../error/customeError');
const ClientFindService = require('./clientFindService');
const CityService = require("../cityService");
const ClientEditService = require("./clientEditService");
const ValidateService = require('../validateService');

module.exports = class ClientAddressService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.clientRepository = new ClientRepository();
        this.clientFindService = new ClientFindService(this.user, this.currentUser, this.language);
        this.cityService = new CityService(this.currentUser, this.language);
        this.clientEditService = new ClientEditService(this.currentUser, this.language);
    }

    async addAddressForClient(authId, address) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);

            ValidateService.validateAddress(address);

            // Check if this is the first address
            const addresses = await this.listClientAddresses(client);
            if(addresses.length === 0){
                const city = await this.cityService.getCityFromLocation(address.lat, address.long);
                await this.clientEditService.editClient(client, {city});
            }

            const defaultAddress = await this.getDefaultAddressOfClient(client);
            const addressObj = {
                ...address,
                // Set address to default if there's no default address
                isDefault: defaultAddress === null,
                isRemoved: false,
                id: admin.firestore().collection(`ids`).doc().id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }
            return await this.clientRepository.addAddress(client.id, addressObj);
        } catch (error) {
            throw error
        }
    }

    async editAddressForClient(authId, addressId, addressUpdate) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const address = await this.findClientAddress(client, addressId);
            if (!address || address.isRemoved) {
                throw new CustomError(this.language, 'errors.validation.addressNotFound');
            }

            return await this.clientRepository.updateAddress(client.id, addressId, { 
                ...addressUpdate, 
                updatedAt: admin.firestore.FieldValue.serverTimestamp()}
            );
        } catch (error) {
            throw error
        }
    }

    async setDefaultAddressForClientByAuthId(authId, addressId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            return await this.setDefaultAddressForClient(client, addressId);
        } catch (error) {
            throw error
        }
    }

    async setDefaultAddressForClientByClientId(clientId, addressId) {
        try {
            const client = await this.clientFindService.findClientById(clientId);
            return await this.setDefaultAddressForClient(client, addressId);
        } catch (error) {
            throw error;
        }
    }

    async setDefaultAddressForClient(client, addressId) {
        try {
            const clientId = client.id;
            const defaultAddress = await this.getDefaultAddressOfClient(client);
            if (defaultAddress !== null) {
                await this.clientRepository.updateAddress(clientId, defaultAddress.id, { isDefault: false });
            }
            return await this.clientRepository.updateAddress(clientId, addressId, { isDefault: true });
        } catch (error) {
            throw error;
        }
    }

    async removeAddressOfClient(authId, addressId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            // remove address
            await this.clientRepository.updateAddress
                (client.id, addressId, { isRemoved: true, isDefault: false });
            const defaultAddress = await this.getDefaultAddressOfClientById(client.id);
            // If the removed address was default,
            // choose the first remaining address to be the default one
            if (defaultAddress === null) {
                const addresses = await this.listClientAddresses(client);
                if (addresses.length > 0) {
                    await this.setDefaultAddressForClient(client, addresses[0].id);
                }
            }
            return await this.getDefaultAddressOfClient(client);
        } catch (error) {
            throw error;
        }
    }

    async getDefaultAddressOfClientByAuthId(authId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            return await this.getDefaultAddressOfClient(client);
        } catch (error) {
            throw error;
        }
    }

    async getDefaultAddressOfClientById(clientId) {
        try {
            const client = await this.clientFindService.findClientById(clientId);
            return await this.getDefaultAddressOfClient(client);
        } catch (error) {
            throw error;
        }
    }

    async getDefaultAddressOfClient(client) {
        try {
            return await this.clientRepository.getDefaultAddressOfClient(client.id);
        } catch (error) {
            throw error;
        }
    }


    async findClientAddressById(clientId, addressId) {
        try {
            const client = await this.clientFindService.findClientById(clientId);
            return await this.findClientAddress(client, addressId);
        } catch (error) {
            throw error;
        }
    }

    async findClientAddressByAuthId(authId, addressId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            return await this.findClientAddress(client, addressId);
        } catch (error) {
            throw error;
        }
    }

    async findClientAddress(client, addressId) {
        try {
            const address = await this.clientRepository.getAddressById(client.id, addressId);
            if (!address || address.isRemoved) {
                throw new CustomError(this.language, 'address.error.addressNotFound');
            }
            return address;
        } catch (error) {
            throw error;
        }
    }

    async listClientAddressesById(clientId) {
        try {
            const client = await this.clientFindService.findClientById(clientId);
            return await this.listClientAddresses(client);
        } catch (error) {
            throw error;
        }
    }

    async listClientAddressesByAuthId(authId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            return await this.listClientAddresses(client);
        } catch (error) {
            throw error
        }
    }

    async listClientAddresses(client) {
        try {
            return await this.clientRepository.getAddressesOfClient(client.id);
        } catch (error) {
            throw error
        }
    }

}