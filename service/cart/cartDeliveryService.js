const admin = require('firebase-admin');
const SubCollectionService = require('../../database/subCollectionRepository');
const ClientFindService = require('../client/clientFindService');

const ChefFindService = require('../chef/chefFindService');
const ClientAddressService = require('../client/clientAddressService');
const SettingsService = require('../settingsService');
const MealFindService = require('../meal/mealFindService');
const ValidateService = require('../validateService');
const CustomError = require('../../error/customeError');

module.exports = class CartDeliveryService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.cartRepository = new SubCollectionService("clients", "carts");
        this.mealFindService = new MealFindService(this.currentUser, this.language);
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        // this.cartFindService = new CartFindService(this.currentUser, this.language);
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.clientAddressService = new ClientAddressService(this.currentUser, this.language);
        this.settingsService = new SettingsService(this.currentUser, this.language);
    }

    async findDeliveryFees(authId, addressId) {
        try {
            const settings = await this.settingsService.findSettings();
            const chefRadius = settings.chefRadius ? settings.chefRadius : 1000;

            const client = await this.clientFindService.findClientByAuthId(authId);
            const CartFindService = require('./cartFindService');
            const cartFindService = new CartFindService(this.currentUser, this.language);
            const cart = await cartFindService.findDetailedCartByAuthId(authId);
            if (!cart.chefId) {
                return 0;
            }
            const chef = await this.chefFindService.findChefById(cart.chefId);

            // get chef address
            const chefAddress = chef.address;
            // get client address
            const clientAddress = await this.clientAddressService.findClientAddress(client, addressId);

            // get distance between the chef and client
            const distance = this.calculateDistanceInKMs(chefAddress, clientAddress);
            if (distance > chefRadius) {
                throw new CustomError(this.language, 'cart.error.outOfArea');
            }

            // get constants for delivery
            const priceForKM = settings.priceForKM ? settings.priceForKM : 0;
            const minDeliveryFees = settings.minDeliveryFees ? settings.minDeliveryFees : 0;
            const maxDeliveryFees = settings.maxDeliveryFees ? settings.maxDeliveryFees : 0;

            const fees = (distance * priceForKM);
            if (fees < minDeliveryFees) {
                return minDeliveryFees;
            } else if (fees > maxDeliveryFees) {
                return maxDeliveryFees;
            }

            return fees;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    calculateDistanceInKMs(addressA, addressB) {
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

}