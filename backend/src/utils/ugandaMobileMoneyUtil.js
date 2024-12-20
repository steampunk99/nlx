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
          webhook_url: config.scriptNetworks.webhookUrl,
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

      return response.data;
    } catch (error) {
      logger.error('Mobile money payment error:', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
    
  }

  async webhookResponse(webhookUrl, trans_id) {
    webhookUrl = config.scriptNetworks.webhookUrl;  
    try {
      const response = await axios.post(webhookUrl, {
        trans_id: trans_id
      }, {
        headers: {
          'Accept': 'application/json',
          'user-agent': 'GuzzleHttp/7',
          'host': 'webhook.site',
          'Content-Type': 'application/json',
          'Content-Length': 80
        }
      });
      console.log('Webhook response:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Webhook response error:', {
        error: error.message,
        response: error.response?.data
      });
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
    }
    catch (error) {
      logger.error('Mobile money withdrawal error:', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }
}



module.exports = new UgandaMobileMoneyUtil();
