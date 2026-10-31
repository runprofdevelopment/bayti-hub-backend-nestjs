const admin = require('firebase-admin')
const { getDatabase } = require('firebase-admin/database')

module.exports = class NewOrdersStats {
    constructor() {
       this.path = `stats/newOrders`
    }

    async incrementNewOrders(year, month) {
        try {
            // This is called only when order created from checkout or auction
            const db = getDatabase()
            const ref = db.ref(`${this.path}/${year}/${month}`)
            ref.set({
                value: admin.database.ServerValue.increment(1)
            })
            return true
        } catch (error) {
            throw error
        }
    }

}