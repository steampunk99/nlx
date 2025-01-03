const axios = require('axios');
const config = require('../config/ugandaMobileMoneyConfig');
const logger = require('../services/logger.service');

class UgandaMobileMoneyUtil {
  async requestToPay(payment) {
    try {
      const response = await axios.post(
        `${config.scriptNetworks.baseUrl}/deposit`,
        {
          amount: payment.amount,
          phone: payment.phone,
          trans_id: payment.trans_id,

          callback_url: config.scriptNetworks.webhookUrl,
          callback_method: 'POST',
          callback_data: JSON.stringify({
            trans_id: payment.trans_id,
            amount: payment.amount,
            phone: payment.phone,
          })
        },
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${config.scriptNetworks.authToken}`,
            'secret_key': config.scriptNetworks.secretKey,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Mobile money request successful:', {
        trans_id: payment.trans_id,
        response: response.data
      });

      return response.data;
    } catch (error) {
      logger.error('Mobile money payment error:', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  async requestWithdrawal(withdrawalData) {
    try {
      const response = await axios.post(
        `${config.scriptNetworks.baseUrl}/withdraw`,
        {
          amount: withdrawalData.amount,
          phone: withdrawalData.phone,
          trans_id: withdrawalData.trans_id,
          reason: 'bills'
        },
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${config.scriptNetworks.authToken}`,
            'secret_key': config.scriptNetworks.secretKey,
            'Content-Type': 'application/json',
            'password': config.scriptNetworks.password
          }
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Mobile money withdrawal error:', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }
}

module.exports = new UgandaMobileMoneyUtil();
