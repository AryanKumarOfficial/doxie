import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import healthRoutes from './routes/health';
import billingRoutes from './routes/billing';
import aiRoutes from './routes/ai';
import authRoutes from './routes/auth';
import organizationRoutes from './routes/organizations';
import { errorHandler } from './common/middleware';
import { env } from './config/env';

const app = express();
const PORT = env.PORT || 4000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Exclude webhook from global json parsing
app.use((req, res, next) => {
  if (req.originalUrl.includes('/billing/webhook')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/organizations', organizationRoutes);
app.use('/billing', billingRoutes);
app.use('/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Doxie API is running');
});

// Global Error Handler
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
