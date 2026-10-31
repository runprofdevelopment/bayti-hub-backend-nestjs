const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const CollectionRepository = require('../../database/collectionRepository');
const AdminFindService = require('./adminFindService');
const ValidateService = require('../validateService');

module.exports = class AdminCreateService {
    constructor(currentUser, language) {
        this.currentUser = currentUser;
        this.language = language;
        this.adminRepository = new CollectionRepository('admins');
        this.adminFindService = new AdminFindService(this.currentUser, this.language);
    }

    async createAdmin(data) {
        try {
            // This is not right behaviour, but have to for testing purpose
            const uid = this.currentUser.uid;

            const email = data.email;
            const password = data.password;
            const pagesAccess = data.pagesAccess;

            // validate email 
            ValidateService.validateEmail(email);
            // validate password
            ValidateService.validatePassword(password);


            // Signup in firebase using email and password
            let userRecord = null;
            try {
                userRecord = await getAuth().createUser({
                    email,
                    password,
                    emailVerified: true,
                });
            } catch (error) {
                userRecord = await getAuth().getUserByEmail(email);
                await getAuth().updateUser(userRecord.uid, { password });
            }

            const newAdminId = userRecord.uid;

            const adminObject = {
                id: newAdminId,
                authenticationUid: newAdminId,
                role: 'admin',
                avatar: null,
                lang: "en",
                pagesAccess: pagesAccess,
                email: email,
                isRemoved: false,
                isEnabled: true,
                createdBy: uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            const resAdmin = await this.adminRepository.setDocument(adminObject);

            return resAdmin;
        } catch (error) {
            throw error;
        }
    }

    async createOwner() {
        try {
            const data = {
                email: 'owner@homefood.app',
                password: '123456',
                pagesAccess: [],
            }
            const uid = this.currentUser.uid;

            const email = data.email;
            const password = data.password;
            const pagesAccess = data.pagesAccess;

            // Signup in firebase using email and password
            let userRecord = null;
            try {
                userRecord = await getAuth().createUser({
                    email,
                    password,
                    emailVerified: true,
                });
            } catch (error) {
                console.log("enter in the error");
                userRecord = await getAuth().getUserByEmail(email);
            }

            const newAdminId = userRecord.uid;

            const admin = {
                id: newAdminId,
                authenticationUid: newAdminId,
                role: 'owner',
                avatar: null,
                lang: "en",
                lang: this.language,
                pagesAccess: [],
                email: data.email,
                isRemoved: false,
                isEnabled: true,
                createdBy: uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }

            const resAdmin = await this.adminRepository.setDocument(admin);

            return resAdmin;
        } catch (error) {
            throw error;
        }
    }
}
