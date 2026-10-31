const ChefFindService = require('./chefFindService');
const ChefEditService = require('./chefEditService');

module.exports = class ChefDashboardReviewService {
    constructor(currentUser, language) {
        this.currentUser = currentUser
        this.language = language
        this.chefFindService = new ChefFindService(this.currentUser, this.language);
        this.chefEditService = new ChefEditService(this.currentUser, this.language);
    }

    async setChefReview(chefId, chefReview) {
        try {
            const chef = await this.chefFindService.findChefById(chefId);

            await this.chefEditService.editChef(chef, { dashboardReview: chefReview });

            return true;
        } catch (error) {
            throw error;
        }
    }

}