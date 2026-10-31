const validator = require('validator');
const geofire = require('geofire-common');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const CustomError = require('../../error/customeError');
const CaptainNotificationService = require('./captainNotificationService');
const CaptainRepository = require('../../database/captainRepository');
const CaptainFindService = require('./captainFindService');
const ValidateService = require('../validateService');


module.exports = class CaptainEditService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.captainRepository = new CaptainRepository();
        this.captainNotificationService = new CaptainNotificationService(this.currentUser, this.language);
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
    }

    async editCaptainByUid(authId, captainUpdate) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            return await this.editCaptain(captain, captainUpdate);
        } catch (error) {
            throw error;
        }
    }

    async editCaptainById(captainId, captainUpdate) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);
            return await this.editCaptain(captain, captainUpdate);
        } catch (error) {
            throw error;
        }
    }

    async editCaptain(captain, captainUpdate) {
        try {
            const email = captainUpdate.email;
            const phoneNumber = captainUpdate.phoneNumber;

            if (email) {
                ValidateService.validateEmail(email);
            }
            if (phoneNumber) {
                ValidateService.validatePhoneNumber(phoneNumber);
            }

            // update notification subscribtion when change language
            if (captainUpdate.lang) {
                captain.lang = captainUpdate.lang;
                await this.captainNotificationService.subscribeCaptain(captain);
            }
            const updateObject = {
                ...captainUpdate,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: captain.id
            }
            await this.captainRepository.editCaptain(captain.id, updateObject);

            return await this.captainFindService.findCaptainById(captain.id);
        } catch (error) {
            throw error
        }
    }

    async setNotificationStatusByUid(authId, notificationStatus) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            // subscribe/unsubcribe this user from notifications
            if (notificationStatus === true) {
                await this.captainNotificationService.subscribeCaptain(captain);
            } else {
                await this.captainNotificationService.unSubscribeCaptain(captain);
            }

            return await this.captainRepository.editCaptain(captain.id, { notification: notificationStatus })
        } catch (error) {
            throw error
        }
    }

    async setCaptainsStatus(captainsIds, status) {
        try {
            for (const captainId of captainsIds) {
                const captain = await this.captainFindService.findCaptainById(captainId);
                await this.editCaptain(captain, { isEnabled: status });
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    async setCurrentLocationByAuthId(authId, lat, lng) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            const hash = geofire.geohashForLocation([lat, lng]);
            return await this.editCaptain(captain, { currentLat: lat, currentLng: lng, geohash: hash });
        } catch (error) {
            throw error;
        }
    }
}