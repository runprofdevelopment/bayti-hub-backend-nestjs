const admin = require('firebase-admin');
const SubCollectionService = require('../../database/subCollectionRepository');

module.exports = class CartCreateService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.cartRepository = new SubCollectionService("clients", "carts");
    }

    async createEmptyCartForClient(client) {
        try {
            const cart = {
                id: client.id,
                chefId: null,
                minOrderAmount: 0,
                itemsCount: 0,
                value: 0,
                items: [],
                createdBy: client.id,
                updatedBy: client.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }
            await this.cartRepository.setDocument(client.id, cart);

            return cart;
        } catch (error) {
            throw error
        }
    }

}