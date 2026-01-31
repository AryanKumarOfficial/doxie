import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health';
import billingRoutes from './routes/billing';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Exclude webhook from global json parsing
app.use((req, res, next) => {
  if (req.originalUrl.includes('/billing/webhook')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use('/health', healthRoutes);
app.use('/billing', billingRoutes);
app.use('/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Doxie API is running');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
