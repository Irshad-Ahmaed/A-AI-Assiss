import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { correlationIdMiddleware } from './middlewares/correlationId';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import departmentRoutes from './routes/department';
import roomRoutes from './routes/room';
import courseRoutes from './routes/course';
import facultyRoutes from './routes/faculty';
import branchRoutes from './routes/branch';
import ingestionRoutes from './routes/ingestion';
import analyticsRoutes from './routes/analytics';
import './workers/ingestionQueue'; // Start the BullMQ worker

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Base Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080'
];
if (process.env.CORS_ORIGIN) {
  if (process.env.CORS_ORIGIN === '*') {
    allowedOrigins.push('*');
  } else {
    allowedOrigins.push(...process.env.CORS_ORIGIN.split(',').map(o => o.trim()));
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(correlationIdMiddleware);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/ingestion', ingestionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
