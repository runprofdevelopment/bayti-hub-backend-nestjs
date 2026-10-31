const admin = require('firebase-admin')
const FirestoreRepositroyHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class CaptainWalletRepository {
    constructor() {
        this.collectionName = 'captains'
        this.subCollectionName = 'wallets'
        this.firestoreRepositroyHelper = new FirestoreRepositroyHelper()

    }

    async addEmptyWalletForCaptain(wallet) {
        try {
            return await this.firestoreRepositroyHelper.setDocumentInSubCollection
            (this.collectionName, wallet.captainId, this.subCollectionName, wallet)
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

    async addCredit(walletId, amount, userId) {
        try {
            const wallet = await this.getWallet(walletId)

            wallet.actualBalance = wallet.actualBalance + amount
            wallet.balance = wallet.balance + amount

            // Update updatedBy and updatedAt
            wallet.updatedAt = admin.firestore.FieldValue.serverTimestamp()
            wallet.updatedBy = userId

            return await this.firestoreRepositroyHelper.updateDocument(this.collectionName, walletId,
                {
                    actualBalance: wallet.actualBalance, balance: wallet.balance,
                    updatedBy: wallet.updatedBy, updatedAt: wallet.updatedAt
                })
        } catch (error) {
            throw error
        }
    }

    async setWalletAmount(walletId, balance, actualBalance, userId) {
        try {
            return await this.firestoreRepositroyHelper.updateDocument(this.collectionName, walletId,
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

    async findWalletById(walletId) {
        try {
            return await this.firestoreRepositroyHelper.getDocumentById
                (this.collectionName, walletId)
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