const admin = require('firebase-admin')
const FirestoreRepositoryHelper = require('./helper/firestoreRepositoryHelper')

module.exports = class SavedRepliesRepository {
    constructor() {
        this.collectionName = 'savedReplies'
        this.firestoreRepositoryHelper = new FirestoreRepositoryHelper()
    }

    async createSavedReply(savedReply) {
        try {
            return await this.firestoreRepositoryHelper.setDocument(this.collectionName, savedReply)
        } catch (error) {
            throw error
        }
    }

    async getSavedReplies() {
        return await this.firestoreRepositoryHelper.getDocumentsByFilter
            (this.collectionName, [])
    }

    async editSavedReply(savedReplyId, savedReply) {
        try {
            return await this.firestoreRepositoryHelper.updateDocument
                (this.collectionName, savedReplyId, savedReply)
        } catch (error) {
            throw error
        }
    }

    async removeSavedReply(savedReplyId) {
        try {
            return await this.firestoreRepositoryHelper.removeDocument
                (this.collectionName, savedReplyId)
        } catch (error) {
            throw error
        }
    }
}