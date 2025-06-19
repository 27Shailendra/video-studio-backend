import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import videoRoutes from './routes/videoRoutes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

const allowedOrigins = [
  'http://localhost:8080',
  'https://video-studio-dashboard-3ol5.vercel.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use(videoRoutes);

export default app;
