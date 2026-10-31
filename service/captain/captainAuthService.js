const admin = require('firebase-admin');
const CaptainEditService = require('./captainEditService');
const CaptainFindService = require('./captainFindService');
const CaptainNotificationService = require('./captainNotificationService');

module.exports = class CaptainAuthService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.captainEditService = new CaptainEditService(this.currentUser, this.language);
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
        this.captainNotificationService = new CaptainNotificationService(this.currentUser, this.language);
    }

    async login(authId, deviceToken) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);

            await this.captainEditService.editCaptain(captain, {
                deviceTokens: admin.firestore.FieldValue.arrayUnion(deviceToken)
            });

            const updatedCaptain = await this.captainFindService.findCaptainByAuthId(authId);
            await this.captainNotificationService.subscribeCaptain(updatedCaptain);

            return captain;
        } catch (error) {
            throw error;
        }
    }

    async logout(authId, deviceToken) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);

            await this.captainNotificationService.unSubscribeCaptain(captain);
            await this.captainEditService.editCaptain(captain, {
                deviceTokens: admin.firestore.FieldValue.arrayRemove(deviceToken)
            });

            const updatedCaptain = await this.captainFindService.findCaptainByAuthId(authId);
            await this.captainNotificationService.subscribeCaptain(updatedCaptain);

            return updatedCaptain;
        } catch (error) {
            throw error;
        }
    }
}