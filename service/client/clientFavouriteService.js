const admin = require('firebase-admin');
const CustomError = require('../../error/customeError');
const ClientFindService = require('../../service/client/clientFindService');
const ChefFindService = require('../chef/chefFindService');
const ClientEditService = require('./clientEditService');

module.exports = class ClientFavouriteService {
    constructor(currentUser, language) {
        this.currentUser = currentUser
        this.language = language
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.clientEditService = new ClientEditService(this.currentUser, this.language);
    }

    async addChefToFavourites(authId, chefId) {
        const client = await this.clientFindService.findClientByAuthId(authId);
        const chef = await this.chefFindService.findChefById(chefId);
        if (!chef || chef.isRemoved || !chef.isEnabled) {
            throw new CustomError(this.language, 'chef.error.chefNotFound')
        }

        await this.clientEditService.editClient(client,
            { favouriteChefs: admin.firestore.FieldValue.arrayUnion(chefId) });

        return await this.listFavouriteChefIds(authId);
    }

    async removeChefFromFavourites(authId, chefId) {
        const client = await this.clientFindService.findClientByAuthId(authId);

        await this.clientEditService.editClient(client,
            { favouriteChefs: admin.firestore.FieldValue.arrayRemove(chefId) });

        return await this.listFavouriteChefIds(authId);
    }

    async listFavouriteChefs(authId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const favouriteChefs = client.favouriteChefs;
            if (!favouriteChefs) {
                return [];
            }

            const chefs = [];
            const chefIds = [];
            for (const chefId of favouriteChefs) {
                const chef = await this.chefFindService.findChefById(chefId);
                if (chef && !chef.isRemoved && chef.isEnabled) {
                    chefs.push(chef);
                    chefIds.push(chef.id);
                }
            }

            await this.clientEditService.editClient(client, { favouriteChefs: chefIds })

            return chefs;
        } catch (error) {
            throw error;
        }
    }

    async listFavouriteChefIds(authId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const favouriteChefs = client.favouriteChefs;
            if (!favouriteChefs) {
                return [];
            }

            const chefIds = [];
            for (const chefId of favouriteChefs) {
                const chef = await this.chefFindService.findChefById(chefId);
                if (chef && !chef.isRemoved && chef.isEnabled) {
                    chefIds.push(chef.id);
                }
            }

            await this.clientEditService.editClient(client, { favouriteChefs: chefIds })

            return chefIds;
        } catch (error) {
            throw error;
        }
    }


}