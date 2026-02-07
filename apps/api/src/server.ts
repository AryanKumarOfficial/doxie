import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/health';
import billingRoutes from './routes/billing';
import aiRoutes from './routes/ai';
import notesRoutes from './routes/notes';
import authRoutes from './routes/auth';
import organizationRoutes from './routes/organizations';

import { isAuthenticated } from './middleware/auth';
import { errorHandler } from './common/middleware';
import { env } from './config/env';

const app = express();
const PORT = env.PORT || 4000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Exclude Stripe webhook from global JSON parsing
app.use((req, res, next) => {
  if (req.originalUrl.includes('/billing/webhook')) {
    return next();
  }
  return express.json()(req, res, next);
});

// Routes
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/organizations', organizationRoutes);
app.use('/billing', billingRoutes); // webhook must remain public

// Protected Routes
app.use('/ai', isAuthenticated, aiRoutes);
app.use('/notes', isAuthenticated, notesRoutes);

app.get('/', (req, res) => {
  res.send('Doxie API is running');
});

// Global Error Handler (must be last)
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
