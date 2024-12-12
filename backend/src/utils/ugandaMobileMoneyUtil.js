const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/ugandaMobileMoneyConfig');
const logger = require('../services/logger.service');

class UgandaMobileMoneyUtil {
    constructor(provider) {
        this.provider = provider.toLowerCase();
        this.config = config[this.provider];
        this.tokenCache = {
            mtn: null,
            airtel: null
        };
    }

    // MTN Money Methods
    async getOAuth2Token() {
        try {
            if (this.provider !== 'mtn') {
                throw new Error('Invalid provider for MTN token');
            }

            // Check cache first
            if (this.tokenCache.mtn?.token && this.tokenCache.mtn?.expiresAt > Date.now()) {
                return this.tokenCache.mtn.token;
            }

            const auth = Buffer.from(
                `${this.config.collection.userId}:${this.config.collection.apiKey}`
            ).toString('base64');

            const response = await axios.post(
                `${this.config.baseUrl}/collection/token/`,
                {},
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Ocp-Apim-Subscription-Key': this.config.collection.primaryKey,
                        'X-Target-Environment': this.config.collection.targetEnvironment
                    }
                }
            );

            // Cache the token
            this.tokenCache.mtn = {
                token: response.data.access_token,
                expiresAt: Date.now() + (response.data.expires_in * 1000)
            };

            return response.data.access_token;
        } catch (error) {
            logger.error('MTN token error:', {
                error: error.message,
                response: error.response?.data
            });
            throw error;
        }
    }

    async requestToPay(payment) {
        try {
            if (this.provider !== 'mtn') {
                throw new Error('Invalid provider');
            }

            const token = await this.getOAuth2Token();
            const referenceId = crypto.randomUUID();

            const response = await axios.post(
                `${this.config.baseUrl}/collection/v1_0/requesttopay`,
                {
                    amount: payment.amount,
                    currency: "EUR",
                    externalId: payment.externalId,
                    payer: {
                        partyIdType: "MSISDN",
                        partyId: payment.phoneNumber
                    },
                    payerMessage: payment.description,
                    payeeNote: payment.description
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Reference-Id': referenceId,
                        'X-Target-Environment': this.config.collection.targetEnvironment,
                        'Ocp-Apim-Subscription-Key': this.config.collection.primaryKey
                    }
                }
            );

            return {
                success: true,
                referenceId,
                statusCode: response.status
            };
        } catch (error) {
            logger.error('MTN payment request error:', {
                error: error.message,
                response: error.response?.data
            });
            throw error;
        }
    }

    // Airtel Money Methods
    async getAirtelToken() {
        try {
            if (this.provider !== 'airtel') {
                throw new Error('Invalid provider for Airtel token');
            }

            // Check cache first
            if (this.tokenCache.airtel?.token && this.tokenCache.airtel?.expiresAt > Date.now()) {
                return this.tokenCache.airtel.token;
            }

            const response = await axios.post(
                `${this.config.baseUrl}/auth/oauth2/token`,
                {
                    client_id: this.config.client_id,
                    client_secret: this.config.client_secret,
                    grant_type: 'client_credentials'
                }
            );

            // Cache the token
            this.tokenCache.airtel = {
                token: response.data.access_token,
                expiresAt: Date.now() + (response.data.expires_in * 1000)
            };

            return response.data.access_token;
        } catch (error) {
            logger.error('Airtel token error:', {
                error: error.message,
                response: error.response?.data
            });
            throw error;
        }
    }

    async collectPayment(payment) {
        try {
            if (this.provider !== 'airtel') {
                throw new Error('Invalid provider for Airtel payment');
            }

            const token = await this.getAirtelToken();
            const referenceId = crypto.randomUUID();

            const response = await axios.post(
                `${this.config.baseUrl}/merchant/v1/payments/`,
                {
                    reference: referenceId,
                    subscriber: {
                        country: this.config.countryCode,
                        currency: this.config.currencyCode,
                        msisdn: payment.phoneNumber
                    },
                    transaction: {
                        amount: payment.amount,
                        country: this.config.countryCode,
                        currency: this.config.currencyCode,
                        id: payment.externalId
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                referenceId,
                statusCode: response.status,
                data: response.data
            };
        } catch (error) {
            logger.error('Airtel payment request error:', {
                error: error.message,
                response: error.response?.data
            });
            throw error;
        }
    }

    // Common Methods
    async checkTransactionStatus(transactionId) {
        try {
            if (this.provider === 'mtn') {
                const token = await this.getOAuth2Token();
                const response = await axios.get(
                    `${this.config.baseUrl}/collection/v1_0/requesttopay/${transactionId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'X-Target-Environment': this.config.collection.targetEnvironment,
                            'Ocp-Apim-Subscription-Key': this.config.collection.primaryKey
                        }
                    }
                );
                return {
                    success: true,
                    status: response.data.status,
                    data: response.data
                };
            } else if (this.provider === 'airtel') {
                const token = await this.getAirtelToken();
                const response = await axios.get(
                    `${this.config.baseUrl}/standard/v1/payments/${transactionId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                return {
                    success: true,
                    status: response.data.status,
                    data: response.data
                };
            }
            throw new Error('Invalid provider');
        } catch (error) {
            logger.error('Transaction status check error:', {
                error: error.message,
                response: error.response?.data
            });
            throw error;
        }
    }
}

module.exports = UgandaMobileMoneyUtil;
