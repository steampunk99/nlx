const mtnMocks = {
    token: {
        success: {
            access_token: 'mtn_test_token',
            token_type: 'access_token',
            expires_in: 3600
        },
        error: {
            error: 'invalid_client',
            error_description: 'Client authentication failed'
        }
    },
    payment: {
        success: {
            status: 'SUCCESSFUL',
            externalId: 'test-mtn-ref',
            reason: 'Payment successful',
            amount: '1000',
            currency: 'UGX',
            payer: {
                partyId: '256771234567',
                partyIdType: 'MSISDN'
            }
        },
        pending: {
            status: 'PENDING',
            externalId: 'test-mtn-ref',
            reason: 'Payment processing',
            amount: '1000',
            currency: 'UGX',
            payer: {
                partyId: '256771234567',
                partyIdType: 'MSISDN'
            }
        },
        failed: {
            status: 'FAILED',
            externalId: 'test-mtn-ref',
            reason: 'Insufficient funds',
            amount: '1000',
            currency: 'UGX',
            payer: {
                partyId: '256771234567',
                partyIdType: 'MSISDN'
            }
        }
    },
    errors: {
        invalidToken: {
            error: 'invalid_token',
            error_description: 'The access token has expired'
        },
        serverError: {
            error: 'server_error',
            error_description: 'Internal server error'
        },
        invalidRequest: {
            error: 'invalid_request',
            error_description: 'Invalid request parameters'
        },
        timeout: {
            error: 'timeout',
            error_description: 'Request timed out'
        }
    },
    transactionStatus: {
        success: {
            status: 'SUCCESSFUL',
            externalId: 'test-mtn-ref',
            amount: '1000',
            currency: 'UGX',
            payer: {
                partyId: '256771234567',
                partyIdType: 'MSISDN'
            },
            payerMessage: 'Payment successful',
            payeeNote: 'Thank you for your payment'
        },
        pending: {
            status: 'PENDING',
            externalId: 'test-mtn-ref',
            amount: '1000',
            currency: 'UGX',
            payer: {
                partyId: '256771234567',
                partyIdType: 'MSISDN'
            },
            payerMessage: 'Payment in progress',
            payeeNote: 'Processing payment'
        },
        failed: {
            status: 'FAILED',
            externalId: 'test-mtn-ref',
            amount: '1000',
            currency: 'UGX',
            payer: {
                partyId: '256771234567',
                partyIdType: 'MSISDN'
            },
            payerMessage: 'Payment failed',
            payeeNote: 'Transaction failed'
        }
    }
};

const airtelMocks = {
    token: {
        success: {
            access_token: 'airtel_test_token',
            token_type: 'Bearer',
            expires_in: 3600
        },
        error: {
            error: 'invalid_client',
            error_description: 'Invalid client credentials'
        }
    },
    payment: {
        success: {
            data: {
                transaction: {
                    id: 'test-airtel-ref',
                    status: 'SUCCESS',
                    message: 'Transaction successful',
                    amount: '1000',
                    currency: 'UGX',
                    msisdn: '256751234567'
                }
            }
        },
        pending: {
            data: {
                transaction: {
                    id: 'test-airtel-ref',
                    status: 'PENDING',
                    message: 'Transaction in progress',
                    amount: '1000',
                    currency: 'UGX',
                    msisdn: '256751234567'
                }
            }
        },
        failed: {
            data: {
                transaction: {
                    id: 'test-airtel-ref',
                    status: 'FAILED',
                    message: 'Insufficient balance',
                    amount: '1000',
                    currency: 'UGX',
                    msisdn: '256751234567'
                }
            }
        }
    },
    errors: {
        invalidToken: {
            error: 'invalid_token',
            error_description: 'Token has expired'
        },
        serverError: {
            error: 'server_error',
            error_description: 'Internal server error'
        },
        invalidRequest: {
            error: 'bad_request',
            error_description: 'Invalid request parameters'
        },
        timeout: {
            error: 'gateway_timeout',
            error_description: 'Request timed out'
        }
    },
    transactionStatus: {
        success: {
            data: {
                transaction: {
                    id: 'test-airtel-ref',
                    status: 'SUCCESS',
                    message: 'Transaction successful',
                    amount: '1000',
                    currency: 'UGX',
                    msisdn: '256751234567',
                    created: new Date().toISOString()
                }
            }
        },
        pending: {
            data: {
                transaction: {
                    id: 'test-airtel-ref',
                    status: 'PENDING',
                    message: 'Transaction in progress',
                    amount: '1000',
                    currency: 'UGX',
                    msisdn: '256751234567',
                    created: new Date().toISOString()
                }
            }
        },
        failed: {
            data: {
                transaction: {
                    id: 'test-airtel-ref',
                    status: 'FAILED',
                    message: 'Transaction failed',
                    amount: '1000',
                    currency: 'UGX',
                    msisdn: '256751234567',
                    created: new Date().toISOString()
                }
            }
        }
    }
};

module.exports = {
    mtnMocks,
    airtelMocks
};
