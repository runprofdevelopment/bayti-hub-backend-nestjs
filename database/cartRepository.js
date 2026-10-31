const admin = require('firebase-admin')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class CaerRespository {
    constructor(){
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()
        this.collectionName = 'carts';
    }

    async addEmptyCart(cart) {
        try {
            return await this.firestoreRepositroyHelper.setDocument(this.collectionName, cart)
        } catch (error) {
            throw error
        }
    }

    async emptyCartForUser(userId){
        const cart = {
            id: userId,
            products: []
        }

        return await this.firestoreRepositroyHelper.setDocument(this.collectionName, cart)
    }

    async getUserCart(cartId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById(this.collectionName, cartId)
        } catch (error) {
            throw error
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument(this.collectionName, cartId, {
                products: admin.firestore.FieldValue.arrayUnion(productId)
            })
        } catch (error) {
            throw error
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument(this.collectionName, cartId, {
                products: admin.firestore.FieldValue.arrayRemove(productId)
            })
        } catch (error) {
            throw error
        }
    }

    async setCartProducts(cartId, productsIds){
        try{
            return await this.firestoreRepositroyHelper.updateDocument(this.collectionName, cartId, {
                products: productsIds
            })
        }catch(error){
            throw error
        }
    }
    
}