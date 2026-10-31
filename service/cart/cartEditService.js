const admin = require("firebase-admin");
const ChefFindService = require('../chef/chefFindService');
const MealFindService = require('../meal/mealFindService');
const SubCollectionRepository = require('../../database/subCollectionRepository');
const CartFindService = require('../cart/cartFindService');
const ClientFindService = require('../client/clientFindService');
const ItemValidateService = require('./ItemInputValidateService');
const CustomError = require('../../error/customeError');

module.exports = class CartEditService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.mealFindService = new MealFindService(this.currentUser, this.language);
        this.cartFindService = new CartFindService(this.currentUser, this.language);
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.itemValidateService = new ItemValidateService(this.currentUser, this.language);
        this.cartRepository = new SubCollectionRepository("clients", "carts");
    }

    async setItemCount(authId, itemId, quantity) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const cart = await this.cartFindService.findCartByClient(client);

            const selectedItem = cart.items.find((item) => item.id === itemId);
            if (selectedItem) {
                selectedItem.quantity = quantity;
            }

            await this.cartRepository.setDocument(client.id, cart);
            return await this.cartFindService.findDetailedCartByClient(client);
        } catch (error) {
            throw error;
        }
    }

    async setAddonCount(authId, itemId, addonId, quantity) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const cart = await this.cartFindService.findCartByClient(client);

            const selectedItem = cart.items.find((item) => item.id === itemId);
            if (selectedItem) {
                const selecetedAddon = selectedItem.addons.find(addon => addon.id === addonId);
                if (selecetedAddon) {
                    selecetedAddon.quantity = quantity;
                }
            }

            await this.cartRepository.setDocument(client.id, cart);
            return await this.cartFindService.findDetailedCartByClient(client);
        } catch (error) {
            throw error;
        }
    }

    async addItemToCart(authId, itemInput) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const cart = await this.cartFindService.findCartByClient(client);

            await this.itemValidateService.validateItem(itemInput);

            itemInput.id = admin.firestore().collection(`ids`).doc().id;
            // check if item belongs to the same chef, otherwise empty cart
            if (cart.chefId !== itemInput.chefId) {
                cart.chefId = itemInput.chefId;
                cart.items = [];
            }

            // Find matched item of it has the same mealId and sizeId
            const matchedItem = cart.items.find(cartItem => cartItem.mealId === itemInput.mealId && cartItem.sizeId === itemInput.sizeId);
            if (matchedItem) {
                matchedItem.quantity += itemInput.quantity;
                //  merge addons
                const newAddons = [];

                itemInput.addons.forEach(itemAddon => {
                    // Check if addon found in cartItem
                    const matchednAddOn = matchedItem.addons.find((addon) => addon.id === itemAddon.id);
                    if (matchednAddOn) {
                        matchednAddOn.quantity += itemAddon.quantity;
                    } else {
                        newAddons.push(itemAddon);
                    }
                })
                matchedItem.addons.push(...newAddons);

            } else {
                cart.items.push(itemInput);
            }

            // Update items count
            const itemsCount = cart.items.reduce(((count, item) => count + item.quantity), 0);
            cart.itemsCount = itemsCount;

            await this.cartRepository.setDocument(client.id, cart);

            return await this.cartFindService.findDetailedCartByClient(client);
        } catch (error) {
            throw error;
        }
    }

    async removeItemFromCart(authId, itemId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const cart = await this.cartFindService.findCartByClient(client);

            const itemIndex = cart.items.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                cart.items.splice(itemIndex, 1);
            }
            await this.cartRepository.setDocument(client.id, cart);

            return await this.cartFindService.findDetailedCartByClient(client);
        } catch (error) {
            throw error;
        }
    }

    async removeAddonFromCart(authId, itemId, addonId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const cart = await this.cartFindService.findCartByClient(client);

            const item = await cart.items.find(item => item.id === itemId);
            if (item) {
                const addonIndex = item.addons.findIndex(addon => addon.id === addonId);
                if (addonIndex > -1) item.addons.splice(addonIndex, 1);
            }
            await this.cartRepository.setDocument(client.id, cart);

            return await this.cartFindService.findDetailedCartByClient(client);
        } catch (error) {
            throw error;
        }
    }
}