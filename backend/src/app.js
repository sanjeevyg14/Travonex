// Entry point for Travonex backend
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import protectedRouter from './routes/protected.js';
import signupRouter from './routes/signup.js';
import loginRouter from './routes/login.js';
import paymentsRouter from './routes/payments.js';
import otpSignupRouter from './routes/otpSignup.js';
import adminRouter from './routes/admin.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';


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

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api/trips', tripsRouter);
app.use('/api/users', usersRouter);
app.use('/api/organizers', organizersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/cities', citiesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/interests', interestsRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/protected', protectedRouter); // Example: requires auth
app.use('/api/auth/signup', signupRouter);
app.use('/api/auth/login', loginRouter);
app.use('/api/auth/otp-signup', otpSignupRouter);

app.get('/', (req, res) => {
    res.send('Travonex Backend API');
});

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
// Connect to MongoDB and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
