const CustomError = require("../error/customeError")

class PermissionService {
    static userHasPermission(user, role, permission) {
        try {
            if (role === 'user') {
                return this.userEnabled(user)
            } else if (role === 'admin' || role === 'owner') {
                return this.adminHasPermission(user, permission)
            } else {
                throw new CustomError(user.lang ? user.lang : 'en', 'user.error.noPermission')
            }
        } catch (error) {
            throw error
        }

    }

    static adminHasPermission(admin, permission) {
        try {
            if (!this.userEnabled(admin)) {
                throw new CustomError(admin.lang ? admin.lang : 'en', 'user.error.noPermission')
            }

            if (admin.role === 'owner') {
                return true
            }

            return true
            
            if(permission === ''){
                return true
            }

            const pagesAccess = admin.pagesAccess
            let res = false
            pagesAccess.forEach(page => {
                if (page === permission) {
                    return true
                }
            });
            throw new CustomError(admin.lang ? admin.lang : 'en', 'user.error.noPermission')
        } catch (error) {
            throw error
        }

    }

    static userEnabled(user) {
        try {
            if (user === undefined ||!user || user === null) {
                throw new CustomError(user.lang ? user.lang : 'en', 'user.error.noPermission')
            }
            if (!user.status || user.status !== 'enabled') {
                throw new CustomError(user.lang ? user.lang : 'en', 'user.error.noPermission')
            }
            return true
        }catch(error){
            throw error
        }
    }
}

module.exports = PermissionService