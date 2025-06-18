const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const path = require('path')
const fileUpload = require('express-fileupload');
const cron = require("node-cron")

const {processDailyPackageRewards} = require("./jobs/dailyPackageRewards")

// Import routes
const authRoutes = require('./routes/auth.routes');
const networkRoutes = require('./routes/network.routes');
const packageRoutes = require('./routes/package.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationRoutes = require('./routes/notification.routes');
const commissionRoutes = require('./routes/commission.routes');
const systemRevenueRoutes = require('./routes/systemRevenue.routes');
const prizeRoutes = require('./routes/prize.routes');
const {expirePrizes} = require("./jobs/prizeExpiryJob")


const { auth } = require('./middleware/auth');

// Import middleware
const { errorHandler } = require('./middleware/error');

const app = express();

// Basic middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://www.earndrip.com', 'https://minerals-two.vercel.app']  // Frontend internal URL
      : ['http://localhost:8080','http://172.28.0.1:8080', 'http://192.168.100.48.8080', 'http://localhost:5173','http://192.168.240.1:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../temp')
}));

app.use(helmet({
    contentSecurityPolicy: false 
}));

// Only use morgan in non-test environment
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}



const createRateLimiter = (windowMs, max) => rateLimit({
    windowMs,max,keyGenerator: (req) => `{req.ip}:${req.path}`
})

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'normal', 
        uptime: process.uptime(),
        version: process.env.npm_package_version || 'v1',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        service: 'Earn Drip API'
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
    customSiteTitle: "earndrip MLM API Documentation",
    customfavIcon: "https://earndrip.com/favicon.ico",
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
app.use('/api/v1/auth', authRoutes,createRateLimiter(1 * 60 * 1000, 10));
app.use('/api/v1/network', networkRoutes);
app.use('/api/v1/packages', packageRoutes);

app.use('/api/v1/withdrawals', withdrawalRoutes,createRateLimiter(1 * 60 * 1000, 20));
app.use('/api/v1/admin', auth, adminRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/dashboard', auth, dashboardRoutes);
app.use('/api/v1/notifications', auth, notificationRoutes);
app.use('/api/v1/commissions', auth, commissionRoutes,createRateLimiter(1 * 60 * 1000, 50));
app.use('/api/v1/system-revenue', systemRevenueRoutes);
app.use('/api/v1/prizes',auth, prizeRoutes,createRateLimiter(1 * 60 * 1000, 10));

// if(process.env.NODE_ENV === 'production') {
//     app.get('*', (req,res) => {
//         res.redirect('https://www.earndrip.com')
//     })
// }

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Resource not found'
    });
});

//cron job
cron.schedule('0 21 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Starting daily package rewards processing...`);
  
  try {
    await processDailyPackageRewards();
    console.log(`[${new Date().toISOString()}] Daily package rewards processed successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to process daily rewards:`, error);
  }
});

//cron job for prize expiry
cron.schedule(
  '*/2 22-23,0-2 * * *',   // every 5 minutes during hours 22–23 and 00–02
  async () => {
    const now = new Date();
    console.log(`[${now.toISOString()}] Starting prize expiry processing...`);
    try {
      await expirePrizes();
      console.log(`[${new Date().toISOString()}] Prize expiry processed successfully`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Failed to process prize expiry:`, error);
    }
  },
  {
    timezone: 'Africa/Kampala'
  }
);


// Keep the service alive
process.on('SIGTERM', () => {
  console.log('Cron service shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Cron service interrupted');
  process.exit(0);
});

module.exports = app;
