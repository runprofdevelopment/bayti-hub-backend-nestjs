const admin = require('firebase-admin')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class ChefWalletRepository {
    constructor() {
        this.collectionName = 'chefs';
        this.subCollectionName = 'wallets';
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper();
    }

    async setWalletForChef(wallet) {
        try {
            return await this.firestoreRepositroyHelper.setDocumentInSubCollection
                (this.collectionName, wallet.chefId, this.subCollectionName, wallet);
        } catch (error) {
            throw error
        }
    }

    async getWallet(walletId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentInSubCollectionById
                (this.collectionName, walletId, this.subCollectionName, walletId);
        } catch (error) {
            throw error
        }
    }

    async updateWallet(walletId, walletUpdate){
        try{
            return await this.firestoreRepositroyHelper.updateDocumentInSubCollection
            (this.collectionName, walletId, this.subCollectionName, walletId,
                walletUpdate)
        }catch(error){
            throw error
        }
    }

}