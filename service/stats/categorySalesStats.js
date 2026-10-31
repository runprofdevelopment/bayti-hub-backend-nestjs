const admin = require('firebase-admin')
const { getDatabase } = require('firebase-admin/database')

module.exports = class TotalSalesStats {
    constructor() {
        this.path = `stats/sales`
    }

    async increaseCategorySales(year, month, amount, category) {
        try {
            // This is called only when order closed
            const db = getDatabase()
            const ref = db.ref(`${this.path}/${category}/${year}/${month}`)
            ref.set({
                value: admin.database.ServerValue.increment(amount)
            })
            return true;
        } catch (error) {
            throw error
        }
    }

}