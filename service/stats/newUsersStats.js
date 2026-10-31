const admin = require('firebase-admin')
const { getDatabase } = require('firebase-admin/database')

module.exports = class TotalProductsStats {
    constructor() {
       this.path = `stats/newUsers`
    }

    async incrementNewUsers(year, month) {
        try {
            // This is called only when new user added
            const db = getDatabase()
            const ref = db.ref(`${this.path}/${year}/${month}`)
            await ref.update({
                value: admin.database.ServerValue.increment(1)
            })
            return true
        } catch (error) {
            throw error
        }
    }

    
}