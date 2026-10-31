const admin = require('firebase-admin');
const CustomError = require('../../error/customeError');
const CaptainNotificationService = require('./captainNotificationService');
const CaptainRepository = require('../../database/captainRepository');
const CaptainFindService = require('./captainFindService');
const CaptainWalletService = require('./captainWalletService');
const VehicleService = require('../vehicleService');
const VariablesService = require('../variablesService');
const ValidateService = require('../validateService');
const CityService = require("../cityService");
const { i18n } = require('../../i18n');

module.exports = class CaptainCreateService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.captainRepository = new CaptainRepository();
        this.captainNotificationService = new CaptainNotificationService(this.currentUser, this.language);
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
        this.captainWalletService = new CaptainWalletService(this.currentUser, this.language);
        this.vehicleService = new VehicleService(this.currentUser, this.language);
        this.variablesService = new VariablesService(this.currentUser, this.language, "variables");
        this.statsService = new VariablesService(this.currentUser, this.language, "stats");
        this.cityService = new CityService(this.currentUser, this.language);
    }

    async createCaptain(data) {
        try {
            const uid = this.currentUser.uid;
            const email = data.email;
            const phoneNumber = data.phoneNumber;

            const captainFoundByAuthId = await this.captainFindService.isCapatainFoundByAuthId(uid);
            if (captainFoundByAuthId) {
                throw new CustomError(this.language, 'captain.error.captainExists');
            }

            if (email) {
                ValidateService.validateEmail(email);
            }
            ValidateService.validatePhoneNumber(phoneNumber);

            const vehicleId = data.vehicleId;
            const vehicle = await this.vehicleService.findVehicleById(vehicleId);

            const id = admin.firestore().collection(`ids`).doc().id;

            // generate captain code and increment it
            const code = await this.variablesService.getVariable("captainCode");
            await this.variablesService.setVariable("captainCode", code + 1);

            const city = await this.cityService.getCityFromLocation(data.lat, data.lng);
            const captain = {
                id,
                code: `D${code}`,
                authenticationUid: uid,
                notification: true,
                isRemoved: false,
                isEnabled: true,
                vehicleId,
                vehicle,
                currentLat: 0,
                currentLng: 0,
                geohash: null,
                pendingOrderId: null,
                pendingOrder: null,
                pendingOrderTime: null,
                deliveringOrderId: null,
                deliveringOrder: null,
                closedOrdersCount: 0,
                cancelledOrdersCount: 0,
                city,
                ...data,
                createdBy: id,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }
            const curretnDeviceToken = data.deviceToken;
            captain.deviceTokens = [curretnDeviceToken];
            delete captain.deviceToken;

            // Add captain to the firestore
            await this.captainRepository.setCaptain(captain);
            // Create empty wallet for the captain
            await this.captainWalletService.creatEmptyWalletForCaptain(captain);
            // Subscribe captain to the 'all' topic notificaction
            await this.captainNotificationService.subscribeCaptain(captain);
            // Send welcome notification to the created captain
            await this.notifyCaptain(captain);

            // update stats aggregation for new users
            await this.statsService.incrementVariable("captainsCount");

            const createdCaptain = await this.captainFindService.findCaptainById(captain.id);

            return createdCaptain;
        } catch (error) {
            throw error;
        }
    }

    async notifyCaptain(captain) {
        try {
            const title = {
                en: i18n('en', 'captain.notification.welcome'),
                ar: i18n('ar', 'captain.notification.welcome')
            }
            const body = {
                en: i18n('en', 'captain.notification.welcome'),
                ar: i18n('ar', 'captain.notification.welcome')
            }
            const data = {
                key: 'newCaptain',
                value: `${captain.id}`
            }

            await this.captainNotificationService.notifyCaptain(captain.id, title, body, data);
        } catch (error) {
            throw error
        }
    }

}