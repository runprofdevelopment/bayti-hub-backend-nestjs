const CaptainEditService = require('./captainEditService');
const CaptainFindService = require('./captainFindService');

module.exports = class CaptainDashboardReviewService {
    constructor(currentUser, language) {
        this.currentUser = currentUser
        this.language = language
        this.captainFindService = new CaptainFindService(this.currentUser, this.language);
        this.captainEditService = new CaptainEditService(this.currentUser, this.language);
    }

    async setCaptainReview(captainId, captainReview) {
        try {
            const captain = await this.captainFindService.findCaptainById(captainId);

            await this.captainEditService.editCaptain(captain, { dashboardReview: captainReview });

            return true;
        } catch (error) {
            throw error;
        }
    }

}