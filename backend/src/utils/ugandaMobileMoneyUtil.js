const axios = require('axios');
const config = require('../config/ugandaMobileMoneyConfig');
const logger = require('../services/logger.service');

class UgandaMobileMoneyUtil {
  async requestToPay(payment) {
    try {
      // const baseUrl = process.env.API_URL || 'http://localhost:3000';
      // const callbackUrl = `${baseUrl}/api/v1/payments/status/callback`;
      
      // logger.info('Requesting mobile money payment with callback URL:', { callbackUrl });
      logger.info('Requesting mobile money payment with webhook URL:', { webhookUrl: config.scriptNetworks.webhookUrl });

      const response = await axios.post(
        `${config.scriptNetworks.baseUrl}/deposit`,
        {
          amount: payment.amount,
          phone: payment.phone,
          trans_id: payment.trans_id,
          webhook_url: config.scriptNetworks.webhookUrl,
          // webhook_url: callbackUrl,
          payment_id: payment.paymentId
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
