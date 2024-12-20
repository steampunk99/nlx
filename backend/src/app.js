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
    origin: process.env.NODE_ENV === 'production'
      ? ['http://capable-ambition.railway.internal','http://capable-ambition-production.up.railway.app']  // Frontend internal URL
      : ['http://localhost:3001', 'http://172.28.0.1:3001', 'http://192.168.100.48.3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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
        uptime: process.uptime(),
        version: process.env.npm_package_version || 'v1',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        service: 'Zillionaires API'
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
app.use('/api/v1/admin', auth, adminRoutes);
app.use('/api/v1/announcements', auth, announcementRoutes);
app.use('/api/v1/payments', paymentRoutes);
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
