const colors = require('colors');
colors.enable();

// const App = require('./app');
// App.init();  

// Initializes Firebase configuration
const configuration = require("./config/config");
configuration.init();

const apis = {
  client: require('./api/client'),
  chef: require('./api/chef'),
  admin: require('./api/admin'),
  captain: require('./api/captain'),
  vehicle: require('./api/vehicle'),
  settings: require('./api/settings'),
  slider: require('./api/slider'),
  category: require('./api/category'),
  meal: require('./api/meal'),
  cart: require('./api/cart'),
  notification: require('./api/notification'),
  order: require('./api/order'),
  reports: require('./api/reports'),
  transaction: require('./api/transaction'),
  exporExcelApi: require('./api/export/exporExcelApi'),
}

//#region [ Ports ]
const HOST_NAME = 'localhost';
//#endregion

// const server = api.listen(0, () => {
//   console.log('Listening on port:', server.address().port);
// });

//#region [ Starts the application on the port specified. ]
console.log('\n');
console.log(colors.yellow('╭──────────────────────────────────────────────────────────────────────────────╮'));
console.log(colors.yellow(`│                                                                              │`));
console.log(colors.yellow(`│                              Servers running at:                             │`));
console.log(colors.yellow(`│                                                                              │`));
console.log(colors.yellow('╰──────────────────────────────────────────────────────────────────────────────╯'));

let PORT = process.env.PORT || 8090;
for (const key in apis) {
  apis[key].listen(PORT, HOST_NAME);
  console.log(colors.yellow(' - Network:'), colors.cyan.underline(`http://${HOST_NAME}:${PORT}/${key}`));
  PORT++;
}