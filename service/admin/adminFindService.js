const admin = require('firebase-admin');
const CollectionRepository = require('../../database/collectionRepository');
const CustomError = require('../../error/customeError');

module.exports = class AdminFindService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.adminRepository = new CollectionRepository("admins");
    }

    async findAdminByAuthId(authenticationUid) {
        const filter = [
            { key: 'authenticationUid', operator: '==', value: authenticationUid },
            { key: 'isRemoved', operator: '==', value: false },
        ]
        const pagination = {
            action: "next",
            firstPage: true,
            limit: 10,
            orderBy: "createdAt",
            sortType: "asc"
        }

        const admins = await this.listAdmins(filter, pagination);

        if (admins.length === 0) {
            throw new CustomError(this.language, 'admin.error.adminNotFound');
        }

        return admins[0];
    }

    async findAdminByIdNotRemoved(adminId) {
        try {
            const admin = await this.findAdminById(adminId);
            if (admin.isRemoved) {
                throw new CustomError(this.language, 'admin.error.adminNotFound');
            }

            return admin;
        } catch (error) {
            throw error;
        }
    }

    async findAdminById(adminId) {
        try {
            const admin = await this.adminRepository.findDocumentById(adminId);
            if (!admin) {
                throw new CustomError(this.language, 'admin.error.adminNotFound');
            }

            return admin;
        } catch (error) {
            throw error;
        }
    }

    async isAdminFoundByAuthId(authenticationUid) {
        try {
            const admin = await this.findAdminByAuthId(authenticationUid);

            return admin !== null;
        } catch (error) {
            return false;
        }
    }

    async listAdminsNotRemoved(filter, pagination) {
        try {
            const appendedFilters = [
                { key: 'isRemoved', operator: '==', value: false },
                ...filter
            ]
            return await this.listAdmins(appendedFilters, pagination);
        } catch (error) {
            throw error;
        }
    }

    async listAdmins(filter, pagination) {
        try {
            return await this.adminRepository.listDocuments(filter, pagination);
        } catch (error) {
            throw error;
        }
    }

    async authStorageToken() {
        return admin.auth().createCustomToken(this.currentUser.uid, {})
    }

}