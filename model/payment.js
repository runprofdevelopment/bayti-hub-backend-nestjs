const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Payment extends AbstractEntityModel {
  constructor() {
    super('payment', 'payment', {
      amount: new types.Number(), 
      trackId: new types.String(), 
      action: new types.Enumerator([
        "1",  // Purchase
        "2",  // Refund 
        "3",  // Void
        "4",  // Authorization
        "5",  // Purchase
        "8",  // Inquiry
        "14", // Auth Extension
      ]),
      language: new types.Enumerator([
        "ar",
        "en"
      ]),
      responseURL: new types.Url(),        // Your End Point That The Result Will Be Send To
      errorURL: new types.Url(),           // Your End Point That The Result Will Be Send To
      payoutAccounts: new AccountsDetails(),
    });
  }
};

const lodash = require('lodash');
const assert = require('assert');

class AccountsDetails {
  // constructor() {}

  /**
   * Validate the field data
   * @param {String} fieldName 
   * @param {String} data 
   * @returns 
   */
   validate(fieldName, data) {
    if (!data) {
      return;
    }

    console.log(data);
    const FIELD_NAME = fieldName ? `\"${fieldName}\"`: ''
    assert(lodash.isArray(data) || lodash.isObject(data), `The ${FIELD_NAME} must be Array or JSON`);
    if (lodash.isArray(data)) {
      data.forEach((item) => {
        assert(lodash.isString(item['bankIdCode']), `The 'payoutAcounts' field must be contain of {bankIdCode} because it is required`);
        assert(lodash.isString(item['iBanNum']), `The 'payoutAcounts' field must be contain of {iBanNum} because it is required`);
        assert(lodash.isString(item['benificiaryName']), `The 'payoutAcounts' field must be contain of {benificiaryName} because it is required`);
        assert(lodash.isString(item['serviceAmount']), `The 'payoutAcounts' field must be contain of {serviceAmount} because it is required`);
        assert(lodash.isString(item['valueDate']), `The 'payoutAcounts' field must be contain of {valueDate} because it is required`);
      });
    } else {
      assert(lodash.isString(item['bankIdCode']), `The payoutAcounts field must be contain of {bankIdCode} because it is required`);
      assert(lodash.isString(item['iBanNum']), `The payoutAcounts field must be contain of {iBanNum} because it is required`);
      assert(lodash.isString(item['benificiaryName']), `The payoutAcounts field must be contain of {benificiaryName} because it is required`);
      assert(lodash.isString(item['serviceAmount']), `The payoutAcounts field must be contain of {serviceAmount} because it is required`);
      assert(lodash.isString(item['valueDate']), `The payoutAcounts field must be contain of {valueDate} because it is required`);
    }
  }

  cast(data) {
    // debugger
    if (!data) {
      // return [];
      return;
    }

    if (lodash.isArray(data) && data.length) {
      return data.map(item => {
        return {
          "bankIdCode": item['bankIdCode'] || null,
          "iBanNum": item['iBanNum'] || null,
          "benificiaryName": item['benificiaryName'] || null,
          "serviceAmount": item['serviceAmount'] || null,
          "valueDate": item['valueDate'] || null,
        }
      });
    } else if (lodash.isArray(data)) {
      return [{
        "bankIdCode": null,
        "iBanNum": null,
        "benificiaryName": null,
        "serviceAmount": null,
        "valueDate": null,
      }]
    } else if (lodash.isObject(data)) {
      return [{
        "bankIdCode": data['bankIdCode'] || null,
        "iBanNum": data['iBanNum'] || null,
        "benificiaryName": data['benificiaryName'] || null,
        "serviceAmount": data['serviceAmount'] || null,
        "valueDate": data['valueDate'] || null,
      }]
    } else {
      return [{
        "bankIdCode": null,
        "iBanNum": null,
        "benificiaryName": null,
        "serviceAmount": null,
        "valueDate": null,
      }]
    }

  }
};