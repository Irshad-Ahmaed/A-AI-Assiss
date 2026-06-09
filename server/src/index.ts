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
import './workers/ingestionQueue'; // Start the BullMQ worker

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Base Middlewares
app.use(cors());
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
