const ChefRepository = require('../../database/chefRepository');
const ChefFindService = require('./chefFindService');
const OrderFindService = require('../order/orderFindService');
const AlgoliaService = require('../algoliaService');
const CustomError = require('../../error/customeError');

module.exports = class UserRemoveService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefRepository = new ChefRepository();
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.orderFindService = new OrderFindService(this.currentUser, this.language);
        this.algoliaService = new AlgoliaService();
    }

    async removeChefs(chefsIds) {
        try {
            for (const chefId of chefsIds) {
                const chef = await this.chefFindService.findChefById(chefId);
                await this.removeChef(chef);
            }

            return true
        } catch (error) {
            throw error
        }
    }

    async removeChefByAuthId(authUid) {
        try {
            const chef = await this.chefFindService.findChefByAuthId(authUid);
            return await this.removeChef(chef);
        } catch (error) {
            throw error
        }

    }

    async removeChef(chef) {
        // check if chef has current orders, cannot be removed
        const orderFilter = [
            { key: 'status', values: ["inProgress", "delivering"], operator: "in" },
            { key: 'chefId', value: chef.id, operator: "==" }
        ]
        const orders = await this.orderFindService.listOrders(orderFilter, undefined);
        if (orders.length > 0) {
            throw new CustomError(this.language, 'chef.error.chefHasOrders');
        }

        // update status
        await this.chefRepository.editChef(chef.id, { isRemoved: true });

        // remove related (algolia, ..)
        await this.algoliaService.removeChefFromAlgolia(chef);

        return true;
    }
}