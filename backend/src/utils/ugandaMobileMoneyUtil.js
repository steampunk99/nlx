const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/ugandaMobileMoneyConfig');

class UgandaMobileMoneyUtil {
    constructor(provider = 'mtn') {
        this.provider = provider;
        this.config = config[provider];
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Get MTN access token
     */
    async getMtnToken(type = 'collection') {
        if (this.accessToken && this.tokenExpiry > Date.now()) {
            return this.accessToken;
        }

        const configType = this.config[type];
        const auth = Buffer.from(`${configType.userId}:${configType.apiKey}`).toString('base64');

        try {
            const response = await axios({
                method: 'post',
                url: `${this.config.baseUrl}/collection/token/`,
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Ocp-Apim-Subscription-Key': configType.primaryKey,
                    'X-Target-Environment': configType.targetEnvironment
                }
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            
            return this.accessToken;
        } catch (error) {
            throw new Error(`Failed to get MTN token: ${error.message}`);
        }
    }

    /**
     * Get Airtel access token
     */
    async getAirtelToken() {
        if (this.accessToken && this.tokenExpiry > Date.now()) {
            return this.accessToken;
        }

        try {
            const response = await axios({
                method: 'post',
                url: `${this.config.baseUrl}/auth/oauth2/token`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    client_id: this.config.client_id,
                    client_secret: this.config.client_secret,
                    grant_type: 'client_credentials'
                }
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            
            return this.accessToken;
        } catch (error) {
            throw new Error(`Failed to get Airtel token: ${error.message}`);
        }
    }

    /**
     * Format phone number for Uganda
     */
    formatPhoneNumber(phoneNumber) {
        // Remove any spaces, hyphens, or plus signs
        let cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
        
        // Remove leading zero if present
        cleaned = cleaned.replace(/^0/, '');
        
        // Add country code if not present
        if (!cleaned.startsWith('256'||'+256')) {
            cleaned = '256' + cleaned;
        }
        
        return cleaned;
    }

    /**
     * Initiate MTN payment request
     */
    async initiateMtnPayment(phoneNumber, amount, reference) {
        const token = await this.getMtnToken('collection');
        const formattedPhone = this.formatPhoneNumber(phoneNumber);
        const externalId = uuidv4();

        try {
            const response = await axios({
                method: 'post',
                url: `${this.config.baseUrl}/collection/v1_0/requesttopay`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Reference-Id': externalId,
                    'X-Target-Environment': this.config.collection.targetEnvironment,
                    'Ocp-Apim-Subscription-Key': this.config.collection.primaryKey,
                    'Content-Type': 'application/json'
                },
                data: {
                    amount: amount.toString(),
                    currency: 'UGX',
                    externalId: reference,
                    payer: {
                        partyIdType: 'MSISDN',
                        partyId: formattedPhone
                    },
                    payerMessage: 'Payment for Zillionaire package',
                    payeeNote: 'Package payment'
                }
            });

            return {
                success: true,
                data: {
                    referenceId: externalId,
                    status: 'PENDING'
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Initiate Airtel payment request
     */
    async initiateAirtelPayment(phoneNumber, amount, reference) {
        const token = await this.getAirtelToken();
        const formattedPhone = this.formatPhoneNumber(phoneNumber);

        try {
            const response = await axios({
                method: 'post',
                url: `${this.config.baseUrl}/merchant/v1/payments/`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    reference: reference,
                    subscriber: {
                        country: this.config.countryCode,
                        currency: this.config.currencyCode,
                        msisdn: formattedPhone
                    },
                    transaction: {
                        amount: amount,
                        country: this.config.countryCode,
                        currency: this.config.currencyCode,
                        id: uuidv4()
                    }
                }
            });

            return {
                success: true,
                data: {
                    referenceId: response.data.data.transaction.id,
                    status: 'PENDING'
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Query MTN transaction status
     */
    async queryMtnTransaction(referenceId) {
        const token = await this.getMtnToken('collection');

        try {
            const response = await axios({
                method: 'get',
                url: `${this.config.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': this.config.collection.targetEnvironment,
                    'Ocp-Apim-Subscription-Key': this.config.collection.primaryKey
                }
            });

            return {
                success: true,
                data: {
                    status: response.data.status,
                    reason: response.data.reason
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Query Airtel transaction status
     */
    async queryAirtelTransaction(referenceId) {
        const token = await this.getAirtelToken();

        try {
            const response = await axios({
                method: 'get',
                url: `${this.config.baseUrl}/standard/v1/payments/${referenceId}`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                data: {
                    status: response.data.data.transaction.status,
                    message: response.data.data.transaction.message
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Process callback data based on provider
     */
    processCallback(callbackData, provider) {
        if (provider === 'mtn') {
            return this.processMtnCallback(callbackData);
        } else if (provider === 'airtel') {
            return this.processAirtelCallback(callbackData);
        }
        throw new Error('Invalid provider specified');
    }

    /**
     * Process MTN callback data
     */
    processMtnCallback(callbackData) {
        if (!callbackData || !callbackData.status) {
            throw new Error('Invalid callback data structure');
        }

        return {
            success: callbackData.status === 'SUCCESSFUL',
            transactionId: callbackData.externalId,
            status: callbackData.status,
            reason: callbackData.reason
        };
    }

    /**
     * Process Airtel callback data
     */
    processAirtelCallback(callbackData) {
        if (!callbackData || !callbackData.data || !callbackData.data.transaction) {
            throw new Error('Invalid callback data structure');
        }

        const transaction = callbackData.data.transaction;
        return {
            success: transaction.status === 'SUCCESS',
            transactionId: transaction.id,
            status: transaction.status,
            message: transaction.message
        };
    }
}

module.exports = UgandaMobileMoneyUtil;
