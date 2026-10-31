const CollectionRepository = require('../../database/collectionRepository');
const AdminFindService = require('./adminFindService');

module.exports = class AdminRemoveService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.adminRepository = new CollectionRepository('admins');
        this.adminFindService = new AdminFindService(this.currentUser, this.language);
    }

    async removeAdmins(adminsIds) {
        try {

            for (const adminId of adminsIds) {
                const admin = await this.adminFindService.findAdminById(adminId);
                await this.adminRepository.editDocument(admin.id, { isRemoved: true });
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    async removeAdminByAuthId(authId) {
        try {
            const admin = await this.adminFindService.findAdminByAuthId(authId);
            return await this.adminRepository.editDocument(admin.id, { isRemoved: true });
        } catch (error) {
            throw error;
        }
    }
}