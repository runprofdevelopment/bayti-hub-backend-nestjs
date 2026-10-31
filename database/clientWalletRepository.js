const admin = require('firebase-admin')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class WalletRepository {
    constructor() {
        this.collectionName = 'clients'
        this.subCollectionName = 'wallets'
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()

    }

    async addEmptyWalletForClient(wallet) {
        try {
            return await this.firestoreRepositroyHelper.setDocumentInSubCollection
                (this.collectionName, wallet.clientId, this.subCollectionName, wallet)
        } catch (error) {
            throw error
        }
    }

    async getWallet(walletId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentInSubCollectionById
                (this.collectionName, walletId, this.subCollectionName, walletId)
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

    async addCredit(walletId, amount) {
        try {
            const wallet = await this.getWallet(walletId)

            wallet.actualBalance = wallet.actualBalance + amount
            wallet.balance = wallet.balance + amount

            // Update updatedBy and updatedAt
            wallet.updatedAt = admin.firestore.FieldValue.serverTimestamp()
            wallet.updatedBy = walletId

            return await this.firestoreRepositroyHelper.updateDocumentInSubCollection
                (this.collectionName, walletId, this.subCollectionName, walletId,
                    {
                        actualBalance: wallet.actualBalance, balance: wallet.balance,
                        updatedBy: wallet.updatedBy, updatedAt: wallet.updatedAt
                    })
        } catch (error) {
            throw error
        }
    }

    async newId() {
        try {
            return await this.firestoreRepositroyHelper.newId()
        } catch (error) {
            throw error
        }
    }

    async setWalletAmount(walletId, balance, actualBalance, userId) {
        try {
            return await this.firestoreRepositroyHelper.updateDocumentInSubCollection
                (this.collectionName, walletId, this.subCollectionName, walletId,
                    {
                        actualBalance,
                        balance,
                        updatedBy: userId,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    })
        } catch (error) {
            throw error
        }
    }

}