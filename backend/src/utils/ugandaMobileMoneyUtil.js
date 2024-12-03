const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/ugandaMobileMoneyConfig');

class UgandaMobileMoneyUtil {
    constructor(provider = 'mtn') {
        this.provider = (provider || 'mtn').toLowerCase();
        
        // Use collection configuration by default
        this.config = {
            baseUrl: config.mtn.baseUrl,
            userId: config.mtn.collection.userId,
            apiKey: config.mtn.collection.apiKey,
            primaryKey: config.mtn.collection.primaryKey,
            targetEnvironment: config.mtn.collection.targetEnvironment
        };
        
        this.accessToken = null;
        this.tokenExpiry = null;
        
        console.log('MTN Mobile Money Utility Initialized:', {
            baseUrl: this.config.baseUrl,
            targetEnvironment: this.config.targetEnvironment
        });
    }

    /**
     * Get MTN access token
     */
    async getOAuth2Token() {
        // Check if we have a valid token
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
          return this.accessToken;
        }
    
        try {
          const credentials = `${this.config.userId}:${this.config.apiKey}`;
          const base64Credentials = Buffer.from(credentials).toString('base64');
    
          console.log('OAuth2 Token Request Details:', {
            baseUrl: this.config.baseUrl,
            userId: this.config.userId,
            apiKey: this.config.apiKey ? 'MASKED' : 'MISSING',
            primaryKey: process.env.MTN_COLLECTION_PRIMARY_KEY ? 'PRESENT' : 'MISSING',
            targetEnvironment: this.config.targetEnvironment,
            base64Credentials: base64Credentials
          });
    
          const response = await axios.post(
            `${this.config.baseUrl}/collection/token/`, 
            new URLSearchParams({
              grant_type: 'client_credentials'
            }),
            {
              headers: {
                'Authorization': `Basic ${base64Credentials}`,
                'Ocp-Apim-Subscription-Key': process.env.MTN_COLLECTION_PRIMARY_KEY, 
                'X-Target-Environment': this.config.targetEnvironment,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              timeout: 10000 // 10 seconds timeout
            }
          );
    
          // Store token and set expiry (typically 1 hour)
          this.accessToken = response.data.access_token;
          this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    
          console.log('OAuth2 Token Retrieved:', {
            tokenLength: this.accessToken?.length,
            expiresIn: response.data.expires_in
          });
    
          return this.accessToken;
        } catch (error) {
          console.error('OAuth2 Token Request Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            config: error.config,
            stack: error.stack
          });
    
          // Detailed error logging
          if (error.response) {
            // The request was made and the server responded with a status code
            console.error('Detailed Error Response:', {
              data: error.response.data,
              status: error.response.status,
              headers: error.response.headers
            });
          } else if (error.request) {
            // The request was made but no response was received
            console.error('No Response Received:', error.request);
          } else {
            // Something happened in setting up the request
            console.error('Request Setup Error:', error.message);
          }
    
          throw error;
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
        console.log('Formatting Phone Number:', phoneNumber);
        
        // Validate input
        if (!phoneNumber) {
            console.error('No phone number provided');
            return null;
        }

        // Ensure input is a string
        let cleaned = String(phoneNumber);
        
        // Remove any spaces, hyphens, or plus signs
        cleaned = cleaned.replace(/[\s\-\+]/g, '');
        
        console.log('Cleaned Phone Number:', cleaned);

        // Remove leading zero if present
        cleaned = cleaned.replace(/^0/, '');
        
        console.log('Removed Leading Zero:', cleaned);

        // Add country code if not present
        if (!cleaned.startsWith('256')) {
            cleaned = '256' + cleaned;
        }
        
        console.log('Final Formatted Phone:', cleaned);
        
        return cleaned;
    }

    /**
     * Initiate MTN payment request
     */
    async initiateMtnPayment(phoneNumber, amount, reference) {
        const token = await this.getOAuth2Token();
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
        const token = await this.getOAuth2Token();

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

    /**
     * Get user information from MTN Mobile Money API
     * @param {string} phoneNumber - User's phone number
     * @returns {Promise<Object>} User information
     */
    async getUserInfo(phoneNumber) {
        try {
            console.log('getUserInfo - START', {
                inputPhoneNumber: phoneNumber,
                configBaseUrl: this.config.baseUrl,
                configTargetEnv: this.config.targetEnvironment
            });
            
            // Validate phone number input
            if (!phoneNumber) {
                console.error('getUserInfo - No phone number provided');
                return {
                    success: false,
                    error: 'No phone number provided'
                };
            }

            // Get access token first
            const token = await this.getOAuth2Token();
            console.log('getUserInfo - OAuth Token:', token ? 'Obtained' : 'Failed', {
                tokenLength: token ? token.length : 0
            });

            if (!token) {
                return {
                    success: false,
                    error: 'Failed to obtain OAuth token'
                };
            }

            // Ensure phone number is formatted correctly
            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            
            // Check if formatting failed
            if (!formattedPhone) {
                console.error('getUserInfo - Phone number formatting failed', { 
                    originalPhone: phoneNumber,
                    formattedPhone: formattedPhone
                });
                return {
                    success: false,
                    error: 'Invalid phone number format'
                };
            }

            console.log('getUserInfo - Formatted Phone:', formattedPhone);

            // Prepare request configuration
            const requestConfig = {
                method: 'get',
                url: `${this.config.baseUrl}/collection/oauth2/v1_0/userinfo`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': this.config.targetEnvironment,
                    'Ocp-Apim-Subscription-Key': this.config.primaryKey,
                    'Accept': 'application/json'
                },
                params: {
                    'msisdn': formattedPhone.replace('+', '')  // MTN API expects number without '+'
                }
            };

            console.log('getUserInfo - Request Configuration:', {
                url: requestConfig.url,
                headers: {
                    Authorization: requestConfig.headers.Authorization ? 'Present' : 'Missing',
                    'X-Target-Environment': requestConfig.headers['X-Target-Environment'],
                    'Ocp-Apim-Subscription-Key': requestConfig.headers['Ocp-Apim-Subscription-Key'] ? 'Present' : 'Missing'
                },
                params: requestConfig.params
            });

            // Make request to MTN userinfo endpoint
            const response = await axios(requestConfig);

            console.log('getUserInfo - Response Received', {
                status: response.status,
                data: response.data ? 'Present' : 'Missing',
                responseData: response.data
            });

            // Return user information
            return {
                success: true,
                data: {
                    phoneNumber: formattedPhone,
                    name: response.data.name,
                    given_name: response.data.given_name,
                    family_name: response.data.family_name,
                    birthdate: response.data.birthdate,
                    locale: response.data.locale,
                    gender: response.data.gender
                }
            };
        } catch (error) {
            console.error('MTN User Info Retrieval Error:', {
                message: error.message,
                response: error.response?.data,
                config: error.config,
                phoneNumber: phoneNumber,
                fullError: error
            });
            
            // Return a more detailed error response
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                statusCode: error.response?.status,
                details: error.response?.data
            };
        }
    }

}

module.exports = UgandaMobileMoneyUtil;
