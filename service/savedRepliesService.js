const admin = require('firebase-admin');
const CollectionRepository = require('../database/collectionRepository');

module.exports = class SavedRepliesService {
    constructor(user, currentUser, language) {
        this.user = user;
        this.currentUser = currentUser;
        this.language = language;
        this.savedReplyRepository = new CollectionRepository('savedReplies');
    }

    async createSavedReply(savedReply) {
        try {
            const savedReplyObject = {
                id: admin.firestore().collection(`ids`)
                    .doc().id,
                ...savedReply
            }

            return await this.savedReplyRepository.setDocument(savedReplyObject);
        } catch (error) {
            throw error;
        }
    }

    async editSavedReply(savedReplyId, savedReply) {
        try {
            return await this.savedReplyRepository.editDocument(savedReplyId, savedReply);
        } catch (error) {
            throw error;
        }
    }

    async removeSavedReply(savedReplyId) {
        try {
            return await this.savedReplyRepository.removeDocument(savedReplyId);
        } catch (error) {
            throw error;
        }
    }

    async listSavedReplies() {
        try {
            return await this.savedReplyRepository.listDocumentsByFilter([]);
        } catch (error) {
            throw error;
        }
    }


}