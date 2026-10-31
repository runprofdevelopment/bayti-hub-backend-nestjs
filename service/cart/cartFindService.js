const ClientFindService = require('../client/clientFindService');
const MealFindService = require('../meal/mealFindService');
const SubCollectionRepository = require('../../database/subCollectionRepository');
const ChefFindService = require('../chef/chefFindService');
const CartDeliveryService = require('./cartDeliveryService');
const ItemService = require('./ItemService');
const ValidateService = require('../validateService');
const ClientAddressService = require('../client/clientAddressService');
const SettingsService = require('../settingsService');
const CustomError = require('../../error/customeError');

module.exports = class CartFindService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.mealFindService = new MealFindService(this.currentUser, this.language);
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.itemService = new ItemService(this.currentUser, this.language);
        this.cartRepository = new SubCollectionRepository('clients', 'carts');
        this.clientAddressService = new ClientAddressService(this.currentUser, this.language);
        this.settingsService = new SettingsService(this.currentUser, this.language);
    }

    async findDetailedCartByAuthId(authId, addressId) {
        try {
            const client = await this.clientFindService.findClientByAuthId(authId);
            const cart = await this.findDetailedCartByClient(client);
            
            const settings = await this.settingsService.findSettings();
            const vat = (settings.vat || 0) / 100;
            const items_vat = cart.value * vat;

            const deliveryFees = await this._findDeliveryFees(client, cart, addressId);
            
            return {
                ...cart,
                deliveryFeesAmount: deliveryFees.fees,
                total_vat_price: deliveryFees.deliveryFeesVat + items_vat,
                total_price: cart.value + items_vat + deliveryFees.fees + deliveryFees.deliveryFeesVat,  
            };
        } catch (error) {
            throw error;
        }
    }

    async _findDeliveryFees(client, cart, addressId) {
        try {
            const settings = await this.settingsService.findSettings();
            const chefRadius = settings.chefRadius ? settings.chefRadius : 1000;

            if (!cart || !cart.chefId || !addressId) {
                // return 0;
                return {
                    fees: 0,
                    deliveryFeesVat: 0,
                }
            }
            const chef = await this.chefFindService.findChefById(cart.chefId);

            // Get chef address
            const chefAddress = chef.address;
            // Get client address
            const clientAddress = await this.clientAddressService.findClientAddress(client, addressId);

            // get distance between the chef and client
            const distance = this._calculateDistanceInKMs(chefAddress, clientAddress);
            if (distance > chefRadius) {
                throw new CustomError(this.language, 'cart.error.outOfArea');
            }

            // get constants for delivery
            const priceForKM = settings.priceForKM ? settings.priceForKM : 0;
            const minDeliveryFees = settings.minDeliveryFees ? settings.minDeliveryFees : 0;
            const maxDeliveryFees = settings.maxDeliveryFees ? settings.maxDeliveryFees : 0;

            const fees = (distance * priceForKM);

            let deliveryFees = 0;
            if (fees < minDeliveryFees) {
                deliveryFees = minDeliveryFees;
            } else if (fees > maxDeliveryFees) {
                deliveryFees = maxDeliveryFees;
            }

            const vat = (settings.vat || 0) / 100;
            const total_vat = deliveryFees * vat;

            return {
                fees: deliveryFees,
                deliveryFeesVat: total_vat
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    _calculateDistanceInKMs(addressA, addressB) {
        try {
            const lat1 = addressA.lat;
            const lon1 = addressA.long;

            const lat2 = addressB.lat;
            const lon2 = addressB.long;

            const p = 0.017453292519943295;    // Math.PI / 180
            const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 +
                Math.cos(lat1 * p) * Math.cos(lat2 * p) *
                (1 - Math.cos((lon2 - lon1) * p)) / 2;

            return 12742 * Math.asin(Math.sqrt(a));
        } catch (error) {
            throw error;
        }
    }

    async findCartByClientId(clientId) {
        try {
            const client = await this.clientFindService.findClientById(clientId);
            const cart = await this.cartRepository.findDocumentById(client.id, client.id);
            const validatedCart = await this.validateCart(cart);

            return validatedCart;
        } catch (error) {
            throw error;
        }
    }

    async findCartByClient(client) {
        try {
            const cart = await this.cartRepository.findDocumentById(client.id, client.id);
            const validatedCart = await this.validateCart(cart);
            return validatedCart;
        } catch (error) {
            throw error;
        }
    }

    async findDetailedCartByClient(client) {
        try {
            const cart = await this.cartRepository.findDocumentById(client.id, client.id);
            const validatedCart = await this.validateCart(cart);
            const chefId = validatedCart.chefId;
            const chef = chefId ? (await this.chefFindService.findChefById(chefId)) : null;

            const updatedItems = [];
            let itemsCount = 0;
            let value = 0;

            // validate items
            const items = validatedCart.items;
            for (const item of items) {
                const updatedItem = await this.itemService.getItem(item);
                if (updatedItem) {
                    updatedItems.push(item);
                    value += item.value;
                    itemsCount += item.quantity;
                }
            }
            validatedCart.items = updatedItems;

            validatedCart.minOrderAmount = cart.chefId ? chef.kitchen.minOrderAmount : 0;
            validatedCart.itemsCount = itemsCount;
            validatedCart.value = ValidateService.roundFloat(value);
            validatedCart.chefName = chef?.kitchen?.kitchenName;

            return validatedCart;
        } catch (error) {
            throw error;
        }
    }

    async validateCart(cart) {
        try {
            const chefId = cart.chefId;
            const chef = chefId ? (await this.chefFindService.findChefById(chefId)) : null;

            // Empty cart in case if chef not found or removed
            if (!chef || chef.isRemoved) {
                cart.chefId = null;
                cart.items = [];
            }

            let itemsCount = 0;
            let value = 0;
            const updatedItems = [];
            // validate items
            const items = cart.items;
            for (const item of items) {
                const updatedItem = await this.itemService.validateItem(item);
                if (updatedItem) {
                    updatedItems.push(item);
                    itemsCount += item.quantity;
                    value += item.value;
                }
            }
            cart.items = updatedItems;
            cart.itemsCount = itemsCount;
            cart.value = value;
            // check if the cart is empty, set chefId to null
            if (cart.items.length === 0) {
                cart.chefId = null;
            }

            return await this.cartRepository.setDocument(cart.id, cart);
        } catch (error) {
            throw error;
        }
    }
}