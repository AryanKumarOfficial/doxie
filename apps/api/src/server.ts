import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/health', healthRoutes);

app.get('/', (req, res) => {
  res.send('Doxie API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
