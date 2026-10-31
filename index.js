const functions = require("firebase-functions");
const clientApi = require("./api/client");
const chefApi = require("./api/chef");
const adminApi = require("./api/admin");
const captainApi = require("./api/captain");
const vehicleApi = require("./api/vehicle");
const settingsApi = require("./api/settings");
const sliderApi = require("./api/slider");
const categoryApi = require("./api/category");
const mealApi = require("./api/meal");
const cartApi = require("./api/cart");
const notificationApi = require("./api/notification");
const orderApi = require("./api/order");
const reportsApi = require('./api/reports');
const transactionApi = require('./api/transaction');
const exportExcelApi = require('./api/export/exporExcelApi');

const OrderCaptainService = require("./service/order/orderCaptainService");
const OrderDeliveringService = require("./service/order/orderDeliveringService");
const OrderReminderService = require("./service/order/orderReminderService");
const PromotionResetService = require("./service/promotion/promotionResetService");

const FirestoreRepositoryHelper = require("./database/helper/firestoreRepositoryHelper");

const configuration = require("./config/config");
const ClientExportService = require("./service/client/clientExportService");
const ExporterFactory = require("./service/shared/exporterFactory");
const VariablesService = require("./service/variablesService");
// initialize configuration
configuration.init();

const admin = require('firebase-admin');
const { AggregateField } = require('firebase-admin/firestore');

const REGION = "europe-west1";

const runtimeOpts = {
  timeoutSeconds: 60,
  memory: "4GB",
};

exports.client = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(clientApi);

exports.chef = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(chefApi);

exports.admin = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(adminApi);

exports.captain = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(captainApi);

exports.vehicle = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(vehicleApi);

exports.slider = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(sliderApi);

exports.settings = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(settingsApi);

exports.category = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(categoryApi);

exports.meal = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(mealApi);

exports.cart = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(cartApi);

exports.notification = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(notificationApi);

exports.order = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(orderApi);

exports.reports = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(reportsApi);

exports.transactions = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(transactionApi);

exports.paymentWebHook = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(async (request, response) => {
    // change location of this code
    try {
      // types: {wallet-charging, bidding, .....}
      const processType = request.query.processType;
      const trandata = request.body.trandata;
      const PaymentWebhookService = require("./service/paymentWebhookService");
      const paymentWebhookService = new PaymentWebhookService();
      const RESPONSE = await paymentWebhookService.handlePayment(
        processType,
        trandata
      );
      RESPONSE && RESPONSE.action == "redirect"
        ? response.redirect(`${RESPONSE.result}`)
        : response.status(200).send(RESPONSE.result);
    } catch (error) {
      response.status(500).send({ code: error.code, message: error.message });
    }
  });

exports.scheduledFunction = functions.region(REGION).pubsub.schedule('every 1 minutes').onRun(async (context) => {
  console.log('This will be run every 1 minute!');
  functions.config().env.TZ = 'Asia/Riyadh';
  process.env.TZ = 'Asia/Riyadh';

  const currentDate = new Date();
  const orderCaptainService = new OrderCaptainService(undefined, "ar");
  await orderCaptainService.removePendingOrdersFromCaptains();

  const orderDeliveringService = new OrderDeliveringService(undefined, "ar");
  await orderDeliveringService.broadcastUnAssignedOrders();

});

exports.alarmFunction = functions.region(REGION).pubsub.schedule('every 1 minutes').onRun(async (context) => {
  const orderReminderService = new OrderReminderService(undefined, "ar");
  await orderReminderService.remindOrders();
});

// run every 24 hours to reset all promoted to false, and 
exports.promotionFunction = functions.region(REGION).pubsub.schedule('0 0 * * *').onRun(async (context) => {
  console.log('promotion function');
  const promotionResetService = new PromotionResetService(undefined, "ar");
  await promotionResetService.resetPromotedChefs();

  await promotionResetService.executePromotions();

});


// Rest 
exports.excel = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(exportExcelApi);


exports.pdf = functions
  .region(REGION)
  .runWith(runtimeOpts)
  .https.onRequest(async (request, res) => {
    try {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader("Content-Disposition", "attachment; filename=" + "clients.pdf");

      const clientExportService = new ClientExportService(null, null);
      const pdf = await clientExportService.exportClientsToPDF();
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      res.status(500).send({ code: error.code, message: error.message });
    }
  });


exports.orderUpdated = functions.firestore
  .document('orders/{id}')
  .onUpdate(async (change, context) => {
    const oldOrder = change.before.data();
    const newOrder = change.after.data();

    const variablesService = new VariablesService(null, null, "badges");
    if (oldOrder.status === newOrder.status) {
      return;
    }
    if (oldOrder.status === "inProgress") {
      await variablesService.incrementVariableByValue("inProgressOrders", -1);
    }
    if (newOrder.status === "inProgress") {
      await variablesService.incrementVariableByValue("inProgressOrders", 1);
    }

  });

exports.transactionCreated = functions.firestore
  .document('transactions/{id}')
  .onCreate(async (snap, context) => {
    const firestoreRepositoryHelper = new FirestoreRepositoryHelper();

    // Client total balance
    const clientWalletsCollection = (await admin.firestore().collectionGroup('wallets').where("clientId", ">", "").get());
    
    const clientWallets = firestoreRepositoryHelper.mapCollection(clientWalletsCollection);
    console.log(clientWallets);
    // const clientWalletsBalanceQuery = clientWallets.aggregate({
    //   sum: AggregateField.sum('balance'),
    // });
    // const totalClientWalletsAmount = await clientWalletsBalanceQuery.get();
    const totalClientWalletsAmount = clientWallets.reduce((prev, doc) => prev + doc?.balance ?? 0, 0);

    // const clientWalletsActualBalanceQuery = clientWallets.aggregate({
    //   sum: AggregateField.sum('actualBalance'),
    // });
    // const totalClientWalletsActualAmount = await clientWalletsActualBalanceQuery.get();
    const totalClientWalletsActualAmount = clientWallets.reduce((prev, doc) => prev + doc?.actualBalance ?? 0 , 0);

    // Chef total balance
    const chefWalletsCollection = await admin.firestore().collectionGroup('wallets').where("chefId", ">", "").get();
    const chefWallets = firestoreRepositoryHelper.mapCollection(chefWalletsCollection);
    // const chefWalletsBalanceQuery = chefWallets.aggregate({
    //   sum: AggregateField.sum('balance'),
    // });
    // const totalChefWalletsAmount = await chefWalletsBalanceQuery.get();
    const totalChefWalletsAmount = chefWallets.reduce((prev, doc) => prev + doc?.balance ?? 0, 0);

    // const chefWalletsActualBalanceQuery = chefWallets.aggregate({
    //   sum: AggregateField.sum('actualBalance'),
    // });
   // const totalChefWalletsActualAmount = await chefWalletsActualBalanceQuery.get();
    const totalChefWalletsActualAmount = chefWallets.reduce((prev, doc) => prev + doc?.actualBalance ?? 0, 0);

    // Captain total balance
    const captainWalletsCollection = await admin.firestore().collectionGroup('wallets').where("captainId", ">", "").get();
    const captainWallets = firestoreRepositoryHelper.mapCollection(captainWalletsCollection);

    // const captainWalletsBalanceQuery = captainWallets.aggregate({
    //   sum: AggregateField.sum('balance'),
    // });
    //const totalCaptainWalletsAmount = await captainWalletsBalanceQuery.get();
    const totalCaptainWalletsAmount = captainWallets.reduce((prev, doc) => prev + doc?.balance ?? 0, 0);

    // const captainWalletsActualBalanceQuery = captainWallets.aggregate({
    //   sum: AggregateField.sum('actualBalance'),
    // });
    const totalCaptainWalletsActualAmount = captainWallets.reduce((prev, doc) => prev + doc?.actualBalance ?? 0, 0);

    const variablesService = new VariablesService(null, "en", "stats");

    await variablesService.setVariable("totalClientWalletsAmount", totalClientWalletsAmount);
    await variablesService.setVariable("totalClientWalletsActualAmount", totalClientWalletsActualAmount);
    await variablesService.setVariable("totalChefWalletsAmount", totalChefWalletsAmount);
    await variablesService.setVariable("totalChefWalletsActualAmount", totalChefWalletsActualAmount);
    await variablesService.setVariable("totalCaptainWalletsAmount", totalCaptainWalletsAmount);
    await variablesService.setVariable("totalCaptainWalletsActualAmount", totalCaptainWalletsActualAmount);

  });


exports.orderCreated = functions.firestore
  .document('orders/{id}')
  .onCreate(async (snap, context) => {
    // Client total balance
    const clientWallets = await admin.firestore().collectionGroup('wallets').where("clientId", ">", "").get();
    const clientWalletsBalanceQuery = clientWallets.aggregate({
      sum: AggregateField.sum('balance'),
    });
    const totalClientWalletsAmount = await clientWalletsBalanceQuery.get();

    const clientWalletsActualBalanceQuery = clientWallets.aggregate({
      sum: AggregateField.sum('actualBalance'),
    });
    const totalClientWalletsActualAmount = await clientWalletsActualBalanceQuery.get();

    // Chef total balance
    const chefWallets = await admin.firestore().collectionGroup('wallets').where("chefId", ">", "").get();
    const chefWalletsBalanceQuery = chefWallets.aggregate({
      sum: AggregateField.sum('balance'),
    });
    const totalChefWalletsAmount = await chefWalletsBalanceQuery.get();

    const chefWalletsActualBalanceQuery = chefWallets.aggregate({
      sum: AggregateField.sum('actualBalance'),
    });
    const totalChefWalletsActualAmount = await chefWalletsActualBalanceQuery.get();

    // Captain total balance
    const captainWallets = await admin.firestore().collectionGroup('wallets').where("captainId", ">", "").get();
    const captainWalletsBalanceQuery = captainWallets.aggregate({
      sum: AggregateField.sum('balance'),
    });
    const totalCaptainWalletsAmount = await captainWalletsBalanceQuery.get();

    const captainWalletsActualBalanceQuery = captainWallets.aggregate({
      sum: AggregateField.sum('actualBalance'),
    });
    const totalCaptainWalletsActualAmount = await captainWalletsActualBalanceQuery.get();

    const variablesService = new VariablesService(null, "en", "stats");

    await variablesService.setVariable("totalClientWalletsAmount", totalClientWalletsAmount);
    await variablesService.setVariable("totalClientWalletsActualAmount", totalClientWalletsActualAmount);
    await variablesService.setVariable("totalChefWalletsAmount", totalChefWalletsAmount);
    await variablesService.setVariable("totalChefWalletsActualAmount", totalChefWalletsActualAmount);
    await variablesService.setVariable("totalCaptainWalletsAmount", totalCaptainWalletsAmount);
    await variablesService.setVariable("totalCaptainWalletsActualAmount", totalCaptainWalletsActualAmount);

  });