const admin = require('firebase-admin');
const RealTimeRepository = require('../database/realTimeRepository');

module.exports = class BadgeService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.badgeRepository = new RealTimeRepository('badges');
    }

    async incrementBadge(name) {
        try {
            await this.badgeRepository.updateVariable(name, {
                value: admin.database.ServerValue.increment(1)
            });
        } catch (error) {
            throw error;
        }
    }

    async decrementBadge(name) {
        try {
            await this.badgeRepository.updateVariable(name, {
                value: admin.database.ServerValue.increment(-1)
            });
        } catch (error) {
            throw error;
        }
    }
}