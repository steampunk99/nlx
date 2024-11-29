const jwt = require('jsonwebtoken');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const generateUser = (overrides = {}) => {
  const password = overrides.password || 'Password123!';
  const hashedPassword = bcrypt.hashSync(password, 10);

  return {
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: hashedPassword,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number(),
    role: 'USER',
    status: 'ACTIVE',
    isVerified: false,
    ...overrides
  };
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id || 1,
      email: user.email,
      role: user.role || 'USER'
    },
    process.env.JWT_SECRET || 'test_secret_key',
    { expiresIn: '1h' }
  );
};

const generatePackage = (overrides = {}) => {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 100, max: 1000 })),
    level: faker.number.int({ min: 1, max: 5 }),
    status: 'ACTIVE',
    benefits: {
      directCommission: faker.number.int({ min: 5, max: 15 }),
      indirectCommission: faker.number.int({ min: 2, max: 5 }),
      maxEarnings: faker.number.int({ min: 5000, max: 50000 })
    },
    ...overrides
  };
};

module.exports = {
  generateUser,
  generateToken,
  generatePackage
};
