const admin = require('firebase-admin')
const OrderFindService = require('../service/order/orderFindService')
const CountryService = require('../service/countryService')
const ProductFindService = require('../service/product/productFindService')

module.exports = class ReportsService {
    constructor(user, currentUser, language) {
        this.user = user
        this.currentUser = currentUser
        this.language = language
        this.orderFindService = new OrderFindService(this.user, this.currentUser, this.language)
        this.countryService = new CountryService(this.user, this.currentUser, this.language)
        this.defaultCountryId = 'Saudi Arabia'
    }

    async listClosedOrdersInDateRange(startDate, endDate) {
        try {
            const filter = [
                { key: 'createdAt', operator: '>=', value: startDate },
                { key: 'createdAt', operator: '<=', value: endDate },
                { key: 'status', operator: '==', value: 'closed' }
            ]
            const orders = await this.orderFindService.listOrdersWithoutPagination(filter)

            return orders
        } catch (error) {
            throw error
        }
    }

    async getSalesReport(startDate, endDate) {
        try {
            const orders = await this.listClosedOrdersInDateRange(startDate, endDate)
            let total = 0
            let taxes = 0
            let sellersPayment = 0
            let profit = 0

            for (const order of orders) {
                total += order.amount ? order.amount : 0
                taxes += order.taxes ? order.taxes : 0
                sellersPayment += order.sellerProfit ? order.sellerProfit : 0
                profit += order.appProfit ? order.appProfit : 0
            }
            const report = {
                total,
                taxes,
                sellersPayment,
                profit
            }
            return report
        } catch (error) {
            throw error
        }
    }

    async getCitiesReport(startDate, endDate) {
        try {
            const orders = await this.listClosedOrdersInDateRange(startDate, endDate)
            const cities = await this.countryService.listCities(this.defaultCountryId)

            const ordersMap = new Map()
            const sellersMap = new Map()
            const buyersMap = new Map()

            const allSellersMap = new Map()
            const allBuyersMap = new Map()

            for (const city of cities) {
                ordersMap.set(city.id, 0)
                sellersMap.set(city.id, 0)
                buyersMap.set(city.id, 0)
            }

            for (const order of orders) {
                const sellerId = order.sellerId
                const buyerId = order.buyerId

                const cityId = order.deliveryType === 'delviery' ? order.address.city.id : order.product.city
                ordersMap.set(cityId, ordersMap.get(cityId) + 1)

                if (!allSellersMap.has(sellerId)) {
                    allSellersMap.set(sellerId, 1)
                    sellersMap.set(cityId, sellersMap.get(cityId) + 1)
                }

                if (!allBuyersMap.has(buyerId)) {
                    allBuyersMap.set(buyerId, 1)
                    buyersMap.set(cityId, buyersMap.get(cityId) + 1)
                }
            }

            const result = []
            for (const city of cities) {
                result.push({
                    cityId: city.id,
                    city,
                    orderCount: ordersMap.get(city.id),
                    sellersCount: sellersMap.get(city.id),
                    buyersCount: buyersMap.get(city.id)
                })
            }

            return result
        } catch (error) {
            throw error
        }
    }

    async getWeeklyTopCities() {
        try {
            const startDate = this.getStartOfTheWeek()
            const endDate = this.getEndOfTheWeek()

            const citiesReport = await this.getCitiesReport(startDate, endDate)

            return this.getTopCitiesOfList(citiesReport)
        } catch (error) {
            throw error
        }
    }

    getStartOfTheWeek() {
        const currentDate = new Date(Date.now())
        const day = currentDate.getDay()
        const dayOfMonth = currentDate.getDate()
        const month = currentDate.getMonth()
        const year = currentDate.getFullYear()

        const difference = (day + 1) % 7

        currentDate.setTime(0)
        currentDate.setDate(dayOfMonth - difference)
        currentDate.setMonth(month)
        currentDate.setFullYear(year)
        const time = currentDate.getTime()

        return time
    }

    getEndOfTheWeek() {
        const currentDate = new Date(Date.now())
        const day = currentDate.getDay()
        const dayOfMonth = currentDate.getDate()
        const month = currentDate.getMonth()
        const year = currentDate.getFullYear()

        const difference = (day + 1) % 7

        currentDate.setTime(24 * 60 * 60 * 1000 - 1)
        currentDate.setDate(dayOfMonth - difference + 7)
        currentDate.setMonth(month)
        currentDate.setFullYear(year)
        const time = currentDate.getTime()

        return time
    }

    getTopCitiesOfList(citiesReport) {
        try {
            console.log(citiesReport)
            let totalOrders = 0
            for (const cityReport of citiesReport) {
                totalOrders += cityReport.orderCount
            }

            citiesReport.sort((cityA, cityB) => {
                if (cityA.orderCount >= cityB.orderCount) {
                    return -1
                } else {
                    return 1
                }
            })

            const result = []
            for (let i = 0; i < 3; i++) {
                let ratio = 0
                if (totalOrders !== 0) {
                    ratio = citiesReport[i].orderCount / totalOrders * 100
                    ratio = Math.round(ratio * 1e2) / 1e2
                }
                console.log(citiesReport[i])
                console.log(ratio)
                citiesReport[i].ratio = ratio
                result.push(citiesReport[i])
            }

            return result
        } catch (error) {
            throw error
        }
    }

    async getMonthlyTopCities() {
        try {
            const currentDate = new Date(Date.now())
            const month = currentDate.getMonth()
            const year = currentDate.getFullYear()


            const startDate = new Date(Date.now())
            startDate.setTime(0)
            startDate.setDate(1)
            startDate.setMonth(month)
            startDate.setFullYear(year)

            const endDate = new Date(Date.now())
            endDate.setTime(0)
            endDate.setDate(1)
            endDate.setMonth(month)
            endDate.setFullYear(year + 1)

            const citiesReport = await this.getCitiesReport(startDate, endDate)

            return this.getTopCitiesOfList(citiesReport)
        } catch (error) {
            throw error
        }
    }

}