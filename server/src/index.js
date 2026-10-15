import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDefaultCategories } from './utils/seedDefaultCategories.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import categoryRoutes from './routes/categories.js';
import transactionRoutes from './routes/transactions.js';
import householdRoutes from './routes/households.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env regardless of where the command is executed
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    app: 'HomeFlow Backend API',
    status: 'running',
    version: '1.0.0',
    collections: [
      'profiles',
      'households',
      'household_members',
      'household_invitations',
      'accounts',
      'categories',
      'transactions',
      'transaction_transfers',
    ],
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Feature APIs
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/households', householdRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  await seedDefaultCategories();

  app.listen(PORT, () => {
    console.log(`🚀 Homeflow API Server is running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
  });
};

startServer();
