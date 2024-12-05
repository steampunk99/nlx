const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const networkRoutes = require('./routes/network.routes');
const packageRoutes = require('./routes/package.routes');
const financeRoutes = require('./routes/finance.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const mobileMoneyRoutes = require('./routes/mobileMoney.routes');
const adminRoutes = require('./routes/admin.routes');
const announcementRoutes = require('./routes/announcement.routes');
const paymentRoutes = require('./routes/payment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
// const reportRoutes = require('./routes/report.routes')
const notificationRoutes = require('./routes/notification.routes')
const commissionRoutes = require('./routes/commission.routes');

const { auth } = require('./middleware/auth');

// Import middleware
const { errorHandler } = require('./middleware/error');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
    contentSecurityPolicy: false // Required for Swagger UI
}));

// Only use morgan in non-test environment
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'Zillionaires API',
        version: 'v1'
    });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 30px 0 }
        .swagger-ui .info .title { font-size: 36px; color: #2c3e50; }
        .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
        .swagger-ui .info .description h2 { font-size: 24px; margin: 30px 0 10px; }
        .swagger-ui .opblock-tag { font-size: 20px; border-bottom: 2px solid #eee; }
        .swagger-ui .opblock { border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .swagger-ui .opblock .opblock-summary { padding: 15px; }
        .swagger-ui .opblock .opblock-summary-method { border-radius: 4px; }
        .swagger-ui .btn { border-radius: 4px; }
        .swagger-ui select { border-radius: 4px; }
        .swagger-ui input { border-radius: 4px; }
        .swagger-ui textarea { border-radius: 4px; }
    `,
    customSiteTitle: "Zillionaire MLM API Documentation",
    customfavIcon: "https://zillionaire.com/favicon.ico",
    swaggerOptions: {
        persistAuthorization: true,
        filter: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
        tryItOutEnabled: true
    }
}));

// JSON documentation endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/network', networkRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/withdrawals', withdrawalRoutes);
app.use('/api/v1/mobile-money', mobileMoneyRoutes);
app.use('/api/v1/admin', auth, adminRoutes);
app.use('/api/v1/announcements', auth, announcementRoutes);
app.use('/api/v1/payments', auth, paymentRoutes);
app.use('/api/v1/dashboard', auth, dashboardRoutes);
app.use('/api/v1/notifications', auth, notificationRoutes);
app.use('/api/v1/commissions', auth, commissionRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Resource not found'
    });
});

module.exports = app;
