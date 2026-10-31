const admin = require('firebase-admin');
const geofire = require('geofire-common');
const SettingsService = require('../settingsService');

module.exports = class CaptainAvailibilityService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.settingsService = new SettingsService(this.currentUser, this.language);
    }

    async getAvailableCaptainsInArea(address) {
        try {
            const settings = await this.settingsService.findSettings();

            const center = [address.lat, address.long];

            // set default captain radius to 10 km
            const radiusInM = settings.captainRadius ? settings.captainRadius * 1000 : 10000;

            const bounds = geofire.geohashQueryBounds(center, radiusInM);
            const promises = [];
            for (const b of bounds) {
                const q = admin.firestore().collection('captains')
                    .orderBy('geohash')
                    .startAt(b[0])
                    .endAt(b[1]);

                promises.push(q.get());
            }

            const snapshots = await Promise.all(promises);
            const captains = [];

            for (const snap of snapshots) {
                for (const doc of snap.docs) {
                    const lat = doc.get('currentLat');
                    const lng = doc.get('currentLng');

                    // We have to filter out a few false positives due to GeoHash
                    // accuracy, but most will match
                    const distanceInKm = geofire.distanceBetween([lat, lng], center);
                    const distanceInM = distanceInKm * 1000;
                    if (distanceInM <= radiusInM && !doc.get("isRemoved") && doc.get("isEnabled")
                        && !doc.get("deliveringOrderId") && !doc.get("pendingOrderId")) {
                        captains.push(doc);
                    }
                }
            }

            return captains;
        } catch (error) {
            throw error;
        }
    }

}