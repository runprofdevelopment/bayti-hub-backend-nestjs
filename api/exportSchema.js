const admin = require('firebase-admin')
const fs = require('fs')
const { mergeSchemas } = require('@graphql-tools/schema')
const utilities = require('graphql/utilities')
const { introspectionFromSchema, graphqlSync, getIntrospectionQuery, buildSchema, buildClientSchema } = require("graphql")
const { fromIntrospectionQuery } = require('graphql-2-json-schema')

const clientSchema = require('./client/schema');
const adminSchema = require('./admin/schema');
const chefSchema = require('./chef/schema');
const captainSchema = require('./captain/schema');
const vehicleSchema = require('./vehicle/schema');
const sliderSchema = require('./slider/schema');
const settingsSchema = require('./settings/schema');
const categorySchema = require('./category/schema');
const mealSchema = require('./meal/schema');
const cartSchema = require('./cart/schema');
const orderSchema = require('./order/schema');
const reportsSchema = require('./reports/schema');
const transactionsSchema = require('./transaction/schema');

const mergedSchema = mergeSchemas({
  schemas: [
    clientSchema, adminSchema, vehicleSchema,
    chefSchema, captainSchema, sliderSchema, 
    settingsSchema, categorySchema, mealSchema, 
    cartSchema, orderSchema, reportsSchema,
    transactionsSchema
  ]
})

fs.writeFileSync('schemas.txt', utilities.printSchema(mergedSchema))

const schema = buildSchema(utilities.printSchema(mergedSchema))
const jsonSchema = introspectionFromSchema(schema)
fs.writeFileSync('schemas.json', JSON.stringify(jsonSchema))

console.log(admin.firestore.FieldValue.serverTimestamp())
console.log(admin.firestore.Timestamp.now())