const ClientFindService = require('./clientFindService');
const ClientEditService = require('./clientEditService');

module.exports = class ClientDashboardReviewService {
    constructor(currentUser, language) {
        this.currentUser = currentUser
        this.language = language
        this.clientFindService = new ClientFindService(this.currentUser, this.language);
        this.clientEditService = new ClientEditService(this.currentUser, this.language);
    }

    async setClientReview(clientId, clientReview) {
        try {
            const client = await this.clientFindService.findClientById(clientId);

            // Set rating and reviewCount
            await this.clientEditService.editClient(client, { dashboardReview: clientReview });

            return true;
        } catch (error) {
            throw error;
        }
    }

}