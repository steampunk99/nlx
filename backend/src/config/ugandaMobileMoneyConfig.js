// Uganda Mobile Money API Configuration
module.exports = {
    mtn: {
        sandbox: process.env.NODE_ENV !== 'production',
        baseUrl: process.env.NODE_ENV === 'production' 
            ? 'https://momodeveloper.mtn.com' 
            : 'https://sandbox.momodeveloper.mtn.com',
        // MTN Uganda API Configuration
        collection: {
            primaryKey: process.env.MTN_COLLECTION_PRIMARY_KEY,
            secondaryKey: process.env.MTN_COLLECTION_SECONDARY_KEY,
            userId: process.env.MTN_COLLECTION_USER_ID,
            apiKey: process.env.MTN_COLLECTION_API_KEY,
            targetEnvironment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
            callbackUrl: process.env.MTN_COLLECTION_CALLBACK_URL,
            notificationUrl: process.env.MTN_COLLECTION_NOTIFICATION_URL
        },
        disbursement: {
            primaryKey: process.env.MTN_DISBURSEMENT_PRIMARY_KEY,
            secondaryKey: process.env.MTN_DISBURSEMENT_SECONDARY_KEY,
            userId: process.env.MTN_DISBURSEMENT_USER_ID,
            apiKey: process.env.MTN_DISBURSEMENT_API_KEY,
            targetEnvironment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
            callbackUrl: process.env.MTN_DISBURSEMENT_CALLBACK_URL
        }
    },
    airtel: {
        sandbox: process.env.NODE_ENV !== 'production',
        baseUrl: process.env.NODE_ENV === 'production'
            ? 'https://openapi.airtel.africa'
            : 'https://openapiuat.airtel.africa',
        // Airtel Money Uganda Configuration
        client_id: process.env.AIRTEL_CLIENT_ID,
        client_secret: process.env.AIRTEL_CLIENT_SECRET,
        countryCode: 'UG',
        currencyCode: 'UGX',
        callbackUrl: process.env.AIRTEL_CALLBACK_URL,
        notificationUrl: process.env.AIRTEL_NOTIFICATION_URL
    }
};
