const axios = require('axios');
const crypto = require('crypto');

class UgandaMobileMoneyUtil {
  constructor(provider) {
    this.provider = provider.toLowerCase();
    this.config = this.getProviderConfig();
  }

  getProviderConfig() {
    const configs = {
      mtn: {
        baseUrl: process.env.MTN_MOBILE_MONEY_BASE_URL,
        apiKey: process.env.MTN_MOBILE_MONEY_API_KEY,
        callbackUrl: process.env.MTN_MOBILE_MONEY_CALLBACK_URL
      },
      airtel: {
        baseUrl: process.env.AIRTEL_MONEY_BASE_URL,
        apiKey: process.env.AIRTEL_MONEY_API_KEY,
        callbackUrl: process.env.AIRTEL_MONEY_CALLBACK_URL
      }
    };

    if (!configs[this.provider]) {
      throw new Error(`Unsupported mobile money provider: ${this.provider}`);
    }

    return configs[this.provider];
  }

  generateTransactionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  async initiateMtnPayment(phoneNumber, amount, referenceId) {
    try {
      const response = await axios.post(`${this.config.baseUrl}/payment`, {
        phoneNumber: this.formatPhoneNumber(phoneNumber),
        amount,
        referenceId,
        callbackUrl: this.config.callbackUrl
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          paymentUrl: response.data.paymentUrl,
          referenceId: response.data.referenceId
        }
      };
    } catch (error) {
      console.error('MTN Mobile Money Payment Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initiation failed'
      };
    }
  }

  async initiateAirtelPayment(phoneNumber, amount, referenceId) {
    try {
      const response = await axios.post(`${this.config.baseUrl}/payment`, {
        phoneNumber: this.formatPhoneNumber(phoneNumber),
        amount,
        referenceId,
        callbackUrl: this.config.callbackUrl
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          paymentUrl: response.data.paymentUrl,
          referenceId: response.data.referenceId
        }
      };
    } catch (error) {
      console.error('Airtel Money Payment Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initiation failed'
      };
    }
  }

  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 0, replace with 256
    if (cleaned.startsWith('0')) {
      return `256${cleaned.slice(1)}`;
    }
    
    // If it starts with 256, return as is
    if (cleaned.startsWith('256')) {
      return cleaned;
    }
    
    // Otherwise, prepend 256
    return `256${cleaned}`;
  }

  async handlePaymentCallback(payload) {
    try {
      // Validate the callback payload
      const { status, referenceId, transactionId } = payload;

      // Update payment status in the database
      await this.updatePaymentStatus(referenceId, status, transactionId);

      return {
        success: true,
        message: 'Callback processed successfully'
      };
    } catch (error) {
      console.error('Payment Callback Error:', error);
      return {
        success: false,
        error: 'Failed to process callback'
      };
    }
  }

  async updatePaymentStatus(referenceId, status, transactionId) {
    // This method would interact with your database to update the payment status
    // You'll need to implement the specific logic based on your database schema
    // Example pseudocode:
    // const payment = await Payment.findOne({ referenceId });
    // payment.status = status;
    // payment.transactionId = transactionId;
    // await payment.save();
  }
}

module.exports = UgandaMobileMoneyUtil;
