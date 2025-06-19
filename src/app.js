import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import videoRoutes from './routes/videoroutes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use(videoRoutes);

export default app;
