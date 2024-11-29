# Zillionaire Network Marketing API

A modern REST API built with Node.js and Express for the Zillionaire Network Marketing platform. This API provides comprehensive functionality for managing network marketing operations, including user authentication, network management, package handling, and financial operations.

## Features

- 🔐 Secure Authentication & Authorization
- 👥 Network Marketing Management
- 📦 Package Management System
- 💰 Commission & Withdrawal Processing
- 📱 Uganda Mobile Money Integration (MTN & Airtel)
- 📢 Announcements & Notifications
- 📊 Comprehensive Reporting
- 📝 Swagger API Documentation
- ✅ Automated Testing Suite

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm (v6 or higher)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize & Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator, Joi
- **Testing**: Jest
- **Documentation**: Swagger
- **Logging**: Winston, Morgan
- **Security**: Helmet, CORS, Rate Limiting
- **Payments**: MTN Mobile Money, Airtel Money

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure the following variables:
     ```
     PORT=3000
     NODE_ENV=development
     
     # Database
     DB_HOST=localhost
     DB_USER=your_db_user
     DB_PASS=your_db_password
     DB_NAME=zillionaire_db
     
     # JWT
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRES_IN=24h
     
     # Email (if using nodemailer)
     SMTP_HOST=your_smtp_host
     SMTP_PORT=587
     SMTP_USER=your_smtp_user
     SMTP_PASS=your_smtp_password

     # MTN Mobile Money (Uganda)
     MTN_PRIMARY_KEY=your_mtn_primary_key
     MTN_SECONDARY_KEY=your_mtn_secondary_key
     MTN_USER_ID=your_mtn_user_id
     MTN_API_KEY=your_mtn_api_key

     # Airtel Money (Uganda)
     AIRTEL_CLIENT_ID=your_airtel_client_id
     AIRTEL_CLIENT_SECRET=your_airtel_client_secret
     ```

4. Initialize the database:
   ```bash
   npx sequelize-cli db:migrate
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:auth
npm run test:network
npm run test:package
npm run test:withdrawal
npm run test:mobile-money

# Run tests with coverage
npm run test:coverage
```

## Mobile Money Integration

The API supports mobile money payments through MTN Mobile Money and Airtel Money in Uganda. Key features include:

- Automatic provider detection based on phone number
- Real-time payment processing
- Secure callback handling
- Transaction status tracking
- Comprehensive error handling

### Mobile Money Endpoints

```
POST /api/mobile-money/callback/mtn     # MTN callback endpoint
POST /api/mobile-money/callback/airtel  # Airtel callback endpoint
GET  /api/mobile-money/status/:paymentId # Check payment status
```

## Project Structure

```
src/
├── config/         # Configuration files and environment setup
├── controllers/    # Route controllers (business logic)
├── middleware/     # Custom middleware (auth, validation, etc.)
├── migrations/     # Database migrations
├── routes/         # API routes definitions
├── services/       # Business logic services
├── utils/          # Helper functions and utilities
├── lib/           # Common libraries and shared code
├── test/          # Test files and test utilities
└── server.js      # Application entry point
```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Available Endpoints

#### Authentication
- POST /auth/register - Register new user
- POST /auth/login - User login
- POST /auth/forgot-password - Request password reset
- GET /auth/profile - Get user profile
- PUT /auth/profile - Update user profile

#### Network Management
- GET /network/referrals - Get direct referrals
- GET /network/children - Get direct children in binary tree
- GET /network/binary-tree - Get complete binary tree structure
- GET /network/genealogy - Get upline/genealogy
- GET /network/stats - Get network statistics

#### Package Management
- GET /packages - Get all packages
- GET /packages/user - Get user's packages
- POST /packages/purchase - Purchase a package
- POST /packages/upgrade - Upgrade existing package
- GET /packages/upgrade-history - Get package upgrade history

#### Financial Operations
- GET /finance/commissions - Get commission history
- GET /finance/withdrawals - Get withdrawal history
- POST /finance/withdrawals - Request withdrawal
- PUT /finance/withdrawals/:id - Process withdrawal (Admin)

For detailed API documentation, visit `/api-docs` when the server is running.

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:
```json
{
  "status": "error",
  "code": 400,
  "message": "Error message here",
  "errors": [] // Additional error details if any
}
```

## Security Features

- JWT-based authentication
- Request rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Password hashing
- SQL injection protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## Support

For support, email konkaniwe@gmail.com or create an issue in the repository.
