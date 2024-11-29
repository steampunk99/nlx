const NodePaymentService = require('../../services/nodePayment.service');
const UgandaMobileMoneyUtil = require('../../utils/ugandaMobileMoneyUtil');
const { mtnMocks, airtelMocks } = require('../helpers/mobileMoneyMocks');
const { generateNode, generateNodePayment } = require('../helpers/generators');
const { faker } = require('@faker-js/faker');

// Mock UgandaMobileMoneyUtil
jest.mock('../../utils/ugandaMobileMoneyUtil');

describe('Node Payment Service Tests', () => {
    let nodePaymentService;
    let mockMobileMoneyUtil;
    let testUser;
    let testNode;
    let testPackage;

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();

        // Create test user
        testUser = await prisma.user.create({
            data: {
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                status: 'ACTIVE'
            }
        });

        // Create test node
        testNode = await prisma.node.create({
            data: generateNode(testUser.id)
        });

        // Create test package
        testPackage = await prisma.nodePackage.create({
            data: {
                name: 'Test Package',
                price: 1000,
                level: 1,
                status: 'ACTIVE'
            }
        });

        // Initialize service
        nodePaymentService = require('../../services/nodePayment.service');
        mockMobileMoneyUtil = UgandaMobileMoneyUtil.mock.instances[0];
    });

    afterEach(async () => {
        // Clean up test data
        await prisma.nodePayment.deleteMany();
        await prisma.nodePackage.deleteMany();
        await prisma.node.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('Mobile Money Payment Processing', () => {
        describe('MTN Money', () => {
            it('should successfully initiate MTN payment', async () => {
                // Mock successful MTN payment initiation
                mockMobileMoneyUtil.initiateMtnPayment.mockResolvedValueOnce({
                    success: true,
                    data: {
                        referenceId: 'test-mtn-ref',
                        status: 'PENDING'
                    }
                });

                const paymentData = {
                    nodeId: testNode.id,
                    packageId: testPackage.id,
                    amount: testPackage.price,
                    paymentMethod: 'MTN',
                    phoneNumber: '256771234567'
                };

                const payment = await nodePaymentService.create(paymentData);

                expect(payment).toBeDefined();
                expect(payment.status).toBe('PENDING');
                expect(payment.reference).toBe('test-mtn-ref');
                expect(mockMobileMoneyUtil.initiateMtnPayment).toHaveBeenCalledTimes(1);
            });

            it('should handle MTN payment failure', async () => {
                // Mock failed MTN payment initiation
                mockMobileMoneyUtil.initiateMtnPayment.mockResolvedValueOnce({
                    success: false,
                    error: 'Payment failed'
                });

                const paymentData = {
                    nodeId: testNode.id,
                    packageId: testPackage.id,
                    amount: testPackage.price,
                    paymentMethod: 'MTN',
                    phoneNumber: '256771234567'
                };

                await expect(nodePaymentService.create(paymentData))
                    .rejects.toThrow('Payment initiation failed');
            });

            it('should successfully query MTN payment status', async () => {
                // Create a test payment
                const payment = await prisma.nodePayment.create({
                    data: generateNodePayment(testNode.id, {
                        packageId: testPackage.id,
                        paymentMethod: 'MTN',
                        status: 'PENDING',
                        reference: 'test-mtn-ref'
                    })
                });

                // Mock successful status query
                mockMobileMoneyUtil.queryMtnTransaction.mockResolvedValueOnce({
                    success: true,
                    data: mtnMocks.payment.success
                });

                const result = await nodePaymentService.queryPaymentStatus(payment.id);

                expect(result.success).toBe(true);
                expect(result.status).toBe('COMPLETED');
                expect(mockMobileMoneyUtil.queryMtnTransaction).toHaveBeenCalledTimes(1);

                // Verify payment was updated
                const updatedPayment = await prisma.nodePayment.findUnique({
                    where: { id: payment.id }
                });
                expect(updatedPayment.status).toBe('COMPLETED');
            });
        });

        describe('Airtel Money', () => {
            it('should successfully initiate Airtel payment', async () => {
                // Mock successful Airtel payment initiation
                mockMobileMoneyUtil.initiateAirtelPayment.mockResolvedValueOnce({
                    success: true,
                    data: {
                        referenceId: 'test-airtel-ref',
                        status: 'PENDING'
                    }
                });

                const paymentData = {
                    nodeId: testNode.id,
                    packageId: testPackage.id,
                    amount: testPackage.price,
                    paymentMethod: 'AIRTEL',
                    phoneNumber: '256701234567'
                };

                const payment = await nodePaymentService.create(paymentData);

                expect(payment).toBeDefined();
                expect(payment.status).toBe('PENDING');
                expect(payment.reference).toBe('test-airtel-ref');
                expect(mockMobileMoneyUtil.initiateAirtelPayment).toHaveBeenCalledTimes(1);
            });

            it('should handle Airtel payment failure', async () => {
                // Mock failed Airtel payment initiation
                mockMobileMoneyUtil.initiateAirtelPayment.mockResolvedValueOnce({
                    success: false,
                    error: 'Payment failed'
                });

                const paymentData = {
                    nodeId: testNode.id,
                    packageId: testPackage.id,
                    amount: testPackage.price,
                    paymentMethod: 'AIRTEL',
                    phoneNumber: '256701234567'
                };

                await expect(nodePaymentService.create(paymentData))
                    .rejects.toThrow('Payment initiation failed');
            });

            it('should successfully query Airtel payment status', async () => {
                // Create a test payment
                const payment = await prisma.nodePayment.create({
                    data: generateNodePayment(testNode.id, {
                        packageId: testPackage.id,
                        paymentMethod: 'AIRTEL',
                        status: 'PENDING',
                        reference: 'test-airtel-ref'
                    })
                });

                // Mock successful status query
                mockMobileMoneyUtil.queryAirtelTransaction.mockResolvedValueOnce({
                    success: true,
                    data: airtelMocks.payment.success
                });

                const result = await nodePaymentService.queryPaymentStatus(payment.id);

                expect(result.success).toBe(true);
                expect(result.status).toBe('COMPLETED');
                expect(mockMobileMoneyUtil.queryAirtelTransaction).toHaveBeenCalledTimes(1);

                // Verify payment was updated
                const updatedPayment = await prisma.nodePayment.findUnique({
                    where: { id: payment.id }
                });
                expect(updatedPayment.status).toBe('COMPLETED');
            });
        });

        describe('Callback Processing', () => {
            it('should process successful MTN callback', async () => {
                // Create a test payment
                const payment = await prisma.nodePayment.create({
                    data: generateNodePayment(testNode.id, {
                        packageId: testPackage.id,
                        paymentMethod: 'MTN',
                        status: 'PENDING',
                        reference: 'test-mtn-ref'
                    })
                });

                // Mock callback processing
                mockMobileMoneyUtil.processMtnCallback.mockReturnValueOnce({
                    success: true,
                    transactionId: 'test-mtn-ref',
                    status: 'SUCCESSFUL'
                });

                const result = await nodePaymentService.processCallback(
                    mtnMocks.payment.success,
                    'mtn'
                );

                expect(result.success).toBe(true);
                expect(mockMobileMoneyUtil.processMtnCallback).toHaveBeenCalledTimes(1);

                // Verify payment was updated
                const updatedPayment = await prisma.nodePayment.findUnique({
                    where: { id: payment.id }
                });
                expect(updatedPayment.status).toBe('COMPLETED');
            });

            it('should process successful Airtel callback', async () => {
                // Create a test payment
                const payment = await prisma.nodePayment.create({
                    data: generateNodePayment(testNode.id, {
                        packageId: testPackage.id,
                        paymentMethod: 'AIRTEL',
                        status: 'PENDING',
                        reference: 'test-airtel-ref'
                    })
                });

                // Mock callback processing
                mockMobileMoneyUtil.processAirtelCallback.mockReturnValueOnce({
                    success: true,
                    transactionId: 'test-airtel-ref',
                    status: 'SUCCESS'
                });

                const result = await nodePaymentService.processCallback(
                    airtelMocks.payment.success,
                    'airtel'
                );

                expect(result.success).toBe(true);
                expect(mockMobileMoneyUtil.processAirtelCallback).toHaveBeenCalledTimes(1);

                // Verify payment was updated
                const updatedPayment = await prisma.nodePayment.findUnique({
                    where: { id: payment.id }
                });
                expect(updatedPayment.status).toBe('COMPLETED');
            });
        });

        describe('Provider Detection', () => {
            it('should detect MTN provider from valid phone number', () => {
                const mtnNumbers = ['256771234567', '256781234567', '256761234567'];
                mtnNumbers.forEach(number => {
                    const provider = nodePaymentService.detectProvider(number);
                    expect(provider).toBe('mtn');
                });
            });

            it('should detect Airtel provider from valid phone number', () => {
                const airtelNumbers = ['256751234567', '256701234567', '256741234567'];
                airtelNumbers.forEach(number => {
                    const provider = nodePaymentService.detectProvider(number);
                    expect(provider).toBe('airtel');
                });
            });

            it('should handle phone numbers with leading zero', () => {
                const number = '0771234567';
                const provider = nodePaymentService.detectProvider(number);
                expect(provider).toBe('mtn');
            });

            it('should throw error for unsupported provider', () => {
                const invalidNumbers = ['256791234567', '256721234567', '123456789'];
                invalidNumbers.forEach(number => {
                    expect(() => nodePaymentService.detectProvider(number)).toThrow('Unsupported mobile money provider');
                });
            });
        });

        describe('Transaction Status Querying', () => {
            it('should query MTN transaction status successfully', async () => {
                const payment = await prisma.nodePayment.create({
                    data: generateNodePayment(testNode.id, {
                        paymentMethod: 'MTN',
                        reference: 'mtn-ref-123',
                        status: 'PROCESSING'
                    })
                });

                mockMobileMoneyUtil.queryMtnTransaction.mockResolvedValueOnce({
                    success: true,
                    data: {
                        status: 'SUCCESSFUL',
                        transactionId: 'mtn-ref-123'
                    }
                });

                const result = await nodePaymentService.queryPaymentStatus(payment.id);
                expect(result.success).toBe(true);
                expect(result.status).toBe('COMPLETED');
            });

            it('should query Airtel transaction status successfully', async () => {
                const payment = await prisma.nodePayment.create({
                    data: generateNodePayment(testNode.id, {
                        paymentMethod: 'AIRTEL',
                        reference: 'airtel-ref-123',
                        status: 'PROCESSING'
                    })
                });

                mockMobileMoneyUtil.queryAirtelTransaction.mockResolvedValueOnce({
                    success: true,
                    data: {
                        status: 'SUCCESS',
                        transactionId: 'airtel-ref-123'
                    }
                });

                const result = await nodePaymentService.queryPaymentStatus(payment.id);
                expect(result.success).toBe(true);
                expect(result.status).toBe('COMPLETED');
            });

            it('should handle failed transaction status query', async () => {
                const payment = await prisma.nodePayment.create({
                    data: generateNodePayment(testNode.id, {
                        paymentMethod: 'MTN',
                        reference: 'mtn-ref-123',
                        status: 'PROCESSING'
                    })
                });

                mockMobileMoneyUtil.queryMtnTransaction.mockResolvedValueOnce({
                    success: false,
                    error: 'Failed to query transaction'
                });

                const result = await nodePaymentService.queryPaymentStatus(payment.id);
                expect(result.success).toBe(false);
                expect(result.error).toBe('Failed to query transaction');
            });

            it('should handle invalid payment ID', async () => {
                await expect(nodePaymentService.queryPaymentStatus('invalid-id'))
                    .rejects
                    .toThrow('Payment not found or invalid');
            });
        });

        describe('Payment Status Transitions', () => {
            it('should handle complete payment lifecycle', async () => {
                // Step 1: Create pending payment
                const payment = await prisma.nodePayment.create({
                    data: generateNodePayment(testNode.id, {
                        paymentMethod: 'MTN',
                        status: 'PENDING'
                    })
                });

                // Step 2: Update to processing
                mockMobileMoneyUtil.initiateMtnPayment.mockResolvedValueOnce({
                    success: true,
                    data: {
                        referenceId: 'mtn-ref-123',
                        status: 'PENDING'
                    }
                });

                await nodePaymentService.update(payment.id, {
                    status: 'PROCESSING',
                    reference: 'mtn-ref-123'
                });

                let updatedPayment = await prisma.nodePayment.findUnique({
                    where: { id: payment.id }
                });
                expect(updatedPayment.status).toBe('PROCESSING');

                // Step 3: Complete payment
                mockMobileMoneyUtil.queryMtnTransaction.mockResolvedValueOnce({
                    success: true,
                    data: {
                        status: 'SUCCESSFUL',
                        transactionId: 'mtn-ref-123'
                    }
                });

                await nodePaymentService.updateStatus(payment.id, 'COMPLETED');
                
                updatedPayment = await prisma.nodePayment.findUnique({
                    where: { id: payment.id }
                });
                expect(updatedPayment.status).toBe('COMPLETED');
            });
        });
    });
});
