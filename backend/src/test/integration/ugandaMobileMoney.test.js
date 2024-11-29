const UgandaMobileMoneyUtil = require('../../utils/ugandaMobileMoneyUtil');
const { mtnMocks, airtelMocks } = require('../helpers/mobileMoneyMocks');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('Uganda Mobile Money Integration Tests', () => {
    let mobileMoneyUtil;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('MTN Mobile Money', () => {
        beforeEach(() => {
            mobileMoneyUtil = new UgandaMobileMoneyUtil('mtn');
        });

        describe('getMtnToken', () => {
            it('should successfully get MTN token', async () => {
                axios.mockResolvedValueOnce({ data: mtnMocks.token });

                const token = await mobileMoneyUtil.getMtnToken();
                expect(token).toBe(mtnMocks.token.access_token);
                expect(axios).toHaveBeenCalledTimes(1);
            });

            it('should throw error on failed token request', async () => {
                axios.mockRejectedValueOnce(new Error('Failed to get token'));

                await expect(mobileMoneyUtil.getMtnToken()).rejects.toThrow('Failed to get MTN token');
                expect(axios).toHaveBeenCalledTimes(1);
            });
        });

        describe('initiateMtnPayment', () => {
            it('should successfully initiate payment', async () => {
                // Mock token request
                axios.mockResolvedValueOnce({ data: mtnMocks.token });
                // Mock payment request
                axios.mockResolvedValueOnce({ status: 202 });

                const result = await mobileMoneyUtil.initiateMtnPayment('256771234567', 1000, 'test-ref');
                
                expect(result.success).toBe(true);
                expect(result.data.status).toBe('PENDING');
                expect(axios).toHaveBeenCalledTimes(2);
            });

            it('should handle payment initiation failure', async () => {
                // Mock token request
                axios.mockResolvedValueOnce({ data: mtnMocks.token });
                // Mock payment request failure
                axios.mockRejectedValueOnce(new Error('Payment failed'));

                const result = await mobileMoneyUtil.initiateMtnPayment('256771234567', 1000, 'test-ref');
                
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(axios).toHaveBeenCalledTimes(2);
            });
        });

        describe('queryMtnTransaction', () => {
            it('should successfully get transaction status', async () => {
                // Mock token request
                axios.mockResolvedValueOnce({ data: mtnMocks.token });
                // Mock status request
                axios.mockResolvedValueOnce({ data: mtnMocks.payment.success });

                const result = await mobileMoneyUtil.queryMtnTransaction('test-ref');
                
                expect(result.success).toBe(true);
                expect(result.data.status).toBe('SUCCESSFUL');
                expect(axios).toHaveBeenCalledTimes(2);
            });

            it('should handle transaction query failure', async () => {
                // Mock token request
                axios.mockResolvedValueOnce({ data: mtnMocks.token });
                // Mock status request failure
                axios.mockRejectedValueOnce(new Error('Query failed'));

                const result = await mobileMoneyUtil.queryMtnTransaction('test-ref');
                
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(axios).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Airtel Money', () => {
        beforeEach(() => {
            mobileMoneyUtil = new UgandaMobileMoneyUtil('airtel');
        });

        describe('getAirtelToken', () => {
            it('should successfully get Airtel token', async () => {
                axios.mockResolvedValueOnce({ data: airtelMocks.token });

                const token = await mobileMoneyUtil.getAirtelToken();
                expect(token).toBe(airtelMocks.token.access_token);
                expect(axios).toHaveBeenCalledTimes(1);
            });

            it('should throw error on failed token request', async () => {
                axios.mockRejectedValueOnce(new Error('Failed to get token'));

                await expect(mobileMoneyUtil.getAirtelToken()).rejects.toThrow('Failed to get Airtel token');
                expect(axios).toHaveBeenCalledTimes(1);
            });
        });

        describe('initiateAirtelPayment', () => {
            it('should successfully initiate payment', async () => {
                // Mock token request
                axios.mockResolvedValueOnce({ data: airtelMocks.token });
                // Mock payment request
                axios.mockResolvedValueOnce({ data: airtelMocks.payment.success });

                const result = await mobileMoneyUtil.initiateAirtelPayment('256701234567', 1000, 'test-ref');
                
                expect(result.success).toBe(true);
                expect(result.data.referenceId).toBeDefined();
                expect(axios).toHaveBeenCalledTimes(2);
            });

            it('should handle payment initiation failure', async () => {
                // Mock token request
                axios.mockResolvedValueOnce({ data: airtelMocks.token });
                // Mock payment request failure
                axios.mockRejectedValueOnce(new Error('Payment failed'));

                const result = await mobileMoneyUtil.initiateAirtelPayment('256701234567', 1000, 'test-ref');
                
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(axios).toHaveBeenCalledTimes(2);
            });
        });

        describe('queryAirtelTransaction', () => {
            it('should successfully get transaction status', async () => {
                // Mock token request
                axios.mockResolvedValueOnce({ data: airtelMocks.token });
                // Mock status request
                axios.mockResolvedValueOnce({ data: airtelMocks.payment.success });

                const result = await mobileMoneyUtil.queryAirtelTransaction('test-ref');
                
                expect(result.success).toBe(true);
                expect(result.data.status).toBe('SUCCESS');
                expect(axios).toHaveBeenCalledTimes(2);
            });

            it('should handle transaction query failure', async () => {
                // Mock token request
                axios.mockResolvedValueOnce({ data: airtelMocks.token });
                // Mock status request failure
                axios.mockRejectedValueOnce(new Error('Query failed'));

                const result = await mobileMoneyUtil.queryAirtelTransaction('test-ref');
                
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(axios).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Phone Number Formatting', () => {
        beforeEach(() => {
            mobileMoneyUtil = new UgandaMobileMoneyUtil();
        });

        it('should format MTN phone number correctly', () => {
            const testCases = [
                { input: '0771234567', expected: '256771234567' },
                { input: '+256771234567', expected: '256771234567' },
                { input: '256771234567', expected: '256771234567' },
                { input: '771234567', expected: '256771234567' }
            ];

            testCases.forEach(({ input, expected }) => {
                expect(mobileMoneyUtil.formatPhoneNumber(input)).toBe(expected);
            });
        });

        it('should format Airtel phone number correctly', () => {
            const testCases = [
                { input: '0701234567', expected: '256701234567' },
                { input: '+256701234567', expected: '256701234567' },
                { input: '256701234567', expected: '256701234567' },
                { input: '701234567', expected: '256701234567' }
            ];

            testCases.forEach(({ input, expected }) => {
                expect(mobileMoneyUtil.formatPhoneNumber(input)).toBe(expected);
            });
        });
    });
});
