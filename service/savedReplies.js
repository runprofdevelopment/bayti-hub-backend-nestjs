const admin = require('firebase-admin');
const SavedReplyRepository = require('../database/collectionRepository');

module.exports = class SavedRepliesService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.savedReplyRepository = new SavedReplyRepository("savedReplies");
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

    async listSavedReplies(){
        try{
            return await this.savedReplyRepository.listDocuments([], null);
        }catch(error){
            throw error;
        }
    }

    
}