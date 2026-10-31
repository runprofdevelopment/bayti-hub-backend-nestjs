const express = require('express')

const mounts = {
  client: './api/client',
  chef: './api/chef',
  admin: './api/admin',
  captain: './api/captain',
  vehicle: './api/vehicle',
  settings: './api/settings',
  slider: './api/slider',
  category: './api/category',
  meal: './api/meal',
  cart: './api/cart',
  notification: './api/notification',
  order: './api/order',
  reports: './api/reports',
  transactions: './api/transaction',
  excel: './api/export/exporExcelApi',
}

function mount(server) {
  const configuration = require('./config/config')
  configuration.init()

  Object.entries(mounts).forEach(([path, file]) => {
    server.use('/' + path, require(file))
  })

  server.use('/paymentWebHook', express.json(), express.urlencoded({ extended: true }))
  server.all('/paymentWebHook', async (request, response) => {
    try {
      const processType = request.query.processType
      const trandata = request.body.trandata
      const PaymentWebhookService = require('./service/paymentWebhookService')
      const paymentWebhookService = new PaymentWebhookService()
      const result = await paymentWebhookService.handlePayment(processType, trandata)
      if (result && result.action === 'redirect') {
        response.redirect(`${result.result}`)
        return
      }
      response.status(200).send(result && result.result)
    } catch (error) {
      response.status(500).send({ code: error.code, message: error.message })
    }
  })

  server.get('/pdf', async (request, response) => {
    try {
      response.setHeader('Content-Type', 'application/pdf')
      response.setHeader('Content-Disposition', 'attachment; filename=clients.pdf')
      const ClientExportService = require('./service/client/clientExportService')
      const clientExportService = new ClientExportService(null, null)
      const pdf = await clientExportService.exportClientsToPDF()
      pdf.pipe(response)
      pdf.end()
    } catch (error) {
      response.status(500).send({ code: error.code, message: error.message })
    }
  })

  server.get('/health', (request, response) => {
    response.json({ name: 'BaytiHub', env: process.env.APP_ENV || 'staging' })
  })
}

function startJobs() {
  const { CronJob } = require('cron')
  process.env.TZ = 'Asia/Riyadh'

  const everyMinute = '0 * * * * *'
  new CronJob(everyMinute, async () => {
    const OrderCaptainService = require('./service/order/orderCaptainService')
    const OrderDeliveringService = require('./service/order/orderDeliveringService')
    const OrderReminderService = require('./service/order/orderReminderService')
    await new OrderCaptainService(undefined, 'ar').removePendingOrdersFromCaptains()
    await new OrderDeliveringService(undefined, 'ar').broadcastUnAssignedOrders()
    await new OrderReminderService(undefined, 'ar').remindOrders()
  }, null, true, 'Asia/Riyadh')

  new CronJob('0 0 0 * * *', async () => {
    const PromotionResetService = require('./service/promotion/promotionResetService')
    const promotionResetService = new PromotionResetService(undefined, 'ar')
    await promotionResetService.resetPromotedChefs()
    await promotionResetService.executePromotions()
  }, null, true, 'Asia/Riyadh')
}

module.exports = { mount, startJobs }
