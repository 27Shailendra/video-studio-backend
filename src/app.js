import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import videoRoutes from './routes/videoRoutes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use(videoRoutes);

export default app;
