const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const firebase = require('firebase/auth');
const ValidateService = require('../validateService');
const CollectionRepository = require('../../database/collectionRepository');
const AdminFindService = require('./adminFindService');

module.exports = class AdminEditService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.adminRepository = new CollectionRepository("admins");
        this.adminFindService = new AdminFindService(this.currentUser, this.language);
    }

    async editAdminByAuthId(authId, adminUpdate) {
        try {
            const admin = await this.adminFindService.findAdminByAuthId(authId);
            return await this.editAdmin(admin, adminUpdate);
        } catch (error) {
            throw error;
        }
    }

    async editAdminById(adminId, adminUpdate) {
        try {
            const admin = await this.adminFindService.findAdminById(adminId);
            return await this.editAdmin(admin, adminUpdate);
        } catch (error) {
            throw error;
        }
    }

    async editAdmin(adminObject, adminUpdate) {
        try {
            const update = {
                ...adminUpdate,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            }
            return await this.adminRepository.editDocument(adminObject.id, update);
        } catch (error) {
            throw error;
        }
    }

    async setAdminsStatus(adminsIds, status) {
        try {
            for (const adminId of adminsIds) {
                await this.editAdminById(adminId, { isEnabled: status });
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    async resetAdminPassword(adminId, password) {
        try {
            const admin = await this.adminFindService.findAdminById(adminId);

            ValidateService.validatePassword(password);

            await getAuth().updateUser(admin.id, {
                password,
            });

            return true;
        } catch (error) {
            throw error;
        }
    }

    async resetMyPassword(authId, oldPassword, newPassword) {
        try {
            const admin = await this.adminFindService.findAdminByAuthId(authId);
            const email = admin.email;
            const auth = firebase.getAuth();
            await firebase.signInWithEmailAndPassword(auth, email, oldPassword);
            const user = await getAuth().updateUser(authId, {
                password: newPassword,
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    async setAdminAccess(adminId, pagesAccess) {
        try {
            const admin = await this.adminFindService.findAdminById(adminId);
            await this.adminRepository.editDocument(adminId, { pagesAccess });

            return true
        } catch (error) {
            throw error
        }
    }
}