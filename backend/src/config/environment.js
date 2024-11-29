require('dotenv').config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'test_secret_key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/zilla_test',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASS: process.env.DB_PASS || 'password',
    DB_NAME: process.env.DB_NAME || 'zilla_test'
};
