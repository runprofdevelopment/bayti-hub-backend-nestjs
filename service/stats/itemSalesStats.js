const admin = require('firebase-admin')
const { getDatabase } = require('firebase-admin/database')

module.exports = class ItemSalesStats {
    constructor() {
       this.path = `stats/itemSales`
    }

    async incrementItemSales(year, month) {
        try {
            // This is called only when order closed
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