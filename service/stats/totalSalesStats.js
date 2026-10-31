const admin = require('firebase-admin')
const { getDatabase } = require('firebase-admin/database')

module.exports = class TotalSalesStats {
    constructor() {
       this.path = `stats/sales/total`
    }

    async increaseTotalSales(year, month, amount) {
        try {
            // This is called only when order closed
            const db = getDatabase()
            const ref = db.ref(`${this.path}/${year}/${month}`)
            await ref.update({
                value: admin.database.ServerValue.increment(amount)
            })
            return true
        } catch (error) {
            throw error
        }
    }

}