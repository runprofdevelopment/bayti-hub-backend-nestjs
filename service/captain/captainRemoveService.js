const CaptainRepository = require('../../database/captainRepository');
const CaptainFindService = require('./captainFindService');
const CustomError = require('../../error/customeError');

module.exports = class CaptainRemoveService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.captainRepository = new CaptainRepository();
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
    }

    async removeCaptains(captainsIds) {
        try {
            for (const captainId of captainsIds) {
                const captain = await this.captainFindService.findCaptainById(captainId);
                await this.removeCaptain(captain);
            }

            return true
        } catch (error) {
            throw error
        }
    }

    async removeCaptainByAuthId(authId) {
        try {
            const captain = await this.captainFindService.findCaptainByAuthId(authId);
            await this.removeCaptain(captain);
            return true
        } catch (error) {
            throw error
        }

    }

    async removeCaptain(captain) {
        // check if captain has delivering orders
        if (captain.deliveringOrderId) {
            throw new CustomError(this.language, 'captain.error.cannotRemoveCaptain');
        }
        // update status
        await this.captainRepository.editCaptain(captain.id, { isRemoved: true });

        return true;
    }
}