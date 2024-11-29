const dotenv = require('dotenv');
const path = require('path');

function loadTestEnvironment() {
    const testEnvPath = path.resolve(process.cwd(), '.env.test');
    const result = dotenv.config({ path: testEnvPath });
    
    if (result.error) {
        console.warn('Warning: .env.test file not found, using default test environment variables');
        
        // Set default test environment variables
        process.env.NODE_ENV = 'test';
        process.env.DB_HOST = 'localhost';
        process.env.DB_USER = 'root';
        process.env.DB_PASS = 'password';
        process.env.DB_NAME = 'zilla_test';
        process.env.DATABASE_URL = 'mysql://root:password@localhost:3306/zilla_test';
        process.env.JWT_SECRET = 'test_secret_key';
        process.env.JWT_EXPIRES_IN = '1h';
    }
    
    // Validate required environment variables
    const requiredEnvVars = [
        'NODE_ENV',
        'DB_HOST',
        'DB_USER',
        'DB_PASS',
        'DB_NAME',
        'DATABASE_URL',
        'JWT_SECRET',
        'JWT_EXPIRES_IN'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
}

module.exports = {
    loadTestEnvironment
};
