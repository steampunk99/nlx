const { faker } = require('@faker-js/faker');

const generateUser = (overrides = {}) => ({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12, pattern: /[A-Za-z0-9!@#$%^&*]/ }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: faker.phone.number(),
    country: faker.location.country(),
    city: faker.location.city(),
    address: faker.location.streetAddress(),
    sponsorUsername: 'admin',
    placementUsername: 'admin',
    position: 'LEFT',
    role: 'USER',
    status: 'ACTIVE',
    ...overrides
});

const generateNode = (userId, overrides = {}) => ({
    userId,
    position: 'LEFT',
    level: 1,
    leftCount: 0,
    rightCount: 0,
    leftPv: 0,
    rightPv: 0,
    totalPv: 0,
    status: 'ACTIVE',
    ...overrides
});

const generateCommission = (userId, overrides = {}) => ({
    userId,
    amount: faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
    type: 'DIRECT',
    description: faker.lorem.sentence(),
    status: 'PENDING',
    ...overrides
});

const generateWithdrawal = (userId, overrides = {}) => ({
    userId,
    amount: faker.number.float({ min: 100, max: 5000, precision: 0.01 }),
    status: 'PENDING',
    method: 'mobile money',
    details: {
        phoneNumber: faker.phone.number(),
        accountName: faker.person.fullName()
    },
    ...overrides
});

const generateNodePayment = (nodeId, overrides = {}) => ({
    nodeId,
    amount: faker.number.float({ min: 50, max: 2000, precision: 0.01 }),
    status: 'PENDING',
    type: 'PACKAGE_PURCHASE',
    reference: faker.string.alphanumeric(10),
    ...overrides
});

const generateNodeStatement = (nodeId, overrides = {}) => ({
    nodeId,
    amount: faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
    type: 'CREDIT',
    description: faker.lorem.sentence(),
    ...overrides
});

const generateNodeWithdrawal = (nodeId, overrides = {}) => ({
    nodeId,
    amount: faker.number.float({ min: 100, max: 5000, precision: 0.01 }),
    status: 'PENDING',
    paymentPhone: faker.phone.number(),
    paymentType: 'mobile money',
    reason: faker.lorem.sentence(),
    ...overrides
});

const generateAnnouncement = (createdBy, overrides = {}) => ({
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(),
    type: 'GENERAL',
    priority: 'LOW',
    status: 'DRAFT',
    createdBy,
    publishDate: faker.date.future(),
    expiryDate: faker.date.future({ refDate: faker.date.future() }),
    ...overrides
});

const generateNotification = (userId, overrides = {}) => ({
    userId,
    title: faker.lorem.sentence(),
    message: faker.lorem.paragraph(),
    type: 'GENERAL',
    isRead: false,
    ...overrides
});

const generateReport = (userId, overrides = {}) => ({
    userId,
    type: 'EARNINGS',
    data: {
        period: 'MONTHLY',
        earnings: faker.number.float({ min: 1000, max: 10000, precision: 0.01 }),
        transactions: faker.number.int({ min: 10, max: 100 })
    },
    status: 'PENDING',
    ...overrides
});

module.exports = {
    generateUser,
    generateNode,
    generateCommission,
    generateWithdrawal,
    generateNodePayment,
    generateNodeStatement,
    generateNodeWithdrawal,
    generateAnnouncement,
    generateNotification,
    generateReport
};
