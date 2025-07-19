// Entry point for Travonex backend
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './utils/db.js';
import './utils/firebase.js';
dotenv.config();

import tripsRouter from './routes/trips.js';
import usersRouter from './routes/users.js';
import organizersRouter from './routes/organizers.js';
import bookingsRouter from './routes/bookings.js';
import citiesRouter from './routes/cities.js';
import categoriesRouter from './routes/categories.js';
import interestsRouter from './routes/interests.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import reviewsRouter from './routes/reviews.js';
import couponsRouter from './routes/coupons.js';
import disputesRouter from './routes/disputes.js';
import adminDisputesRouter from './routes/adminDisputes.js';
import bannersRouter from './routes/banners.js';
import protectedRouter from './routes/protected.js';
import signupRouter from './routes/signup.js';
import loginRouter from './routes/login.js';
import paymentsRouter from './routes/payments.js';
import otpSignupRouter from './routes/otpSignup.js';
import adminRouter from './routes/admin.js';
import adminAccessRouter from './routes/adminAccess.js';
import adminAuditLogsRouter from './routes/adminAuditLogs.js';
import contentRouter from './routes/content.js';
import faqsRouter from './routes/faqs.js';

// Mapping of base paths to routers for Swagger docs
export const routeMappings = [
  ['/api/trips', tripsRouter],
  ['/api/users', usersRouter],
  ['/api/organizers', organizersRouter],
  ['/api/bookings', bookingsRouter],
  ['/api/coupons', couponsRouter],
  ['/api/disputes', disputesRouter],
  ['/api/admin/disputes', adminDisputesRouter],
  ['/api/reviews', reviewsRouter],
  ['/api/cities', citiesRouter],
  ['/api/categories', categoriesRouter],
  ['/api/interests', interestsRouter],
  ['/api/banners', bannersRouter],
  ['/api/auth', authRouter],
  ['/api/upload', uploadRouter],
  ['/api/payments', paymentsRouter],
  ['/api/admin/audit-logs', adminAuditLogsRouter],
  ['/api/admin', adminRouter],
  ['/api/admin', adminAccessRouter],
  ['/api/protected', protectedRouter],
  ['/api/auth/signup', signupRouter],
  ['/api/auth/login', loginRouter],
  ['/api/auth/otp-signup', otpSignupRouter],
  ['/api/content', contentRouter],
  ['/api/faqs', faqsRouter]
];
import swaggerUi from 'swagger-ui-express';
import generateSwaggerSpec from './swagger.js';


const app = express();

// Enable CORS using allowed origins from env
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// API routes
for (const [basePath, router] of routeMappings) {
  app.use(basePath, router);
}

app.get('/', (req, res) => {
    res.send('Travonex Backend API');
});

const swaggerSpec = generateSwaggerSpec(routeMappings);
const swaggerSpec = generateSwaggerSpec(app, routeMappings);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

const PORT = process.env.PORT || 5000;
// Connect to MongoDB and start server when not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

export default app;
