import express from 'express';
import upload from "../middlewares/multer.js"
import { uploadVideo } from '../controllers/videoController.js';
import { trimVideo } from '../controllers/videoTrimControlller.js';
import Video from '../models/video.model.js';

const router = express.Router();

//videos by userId
router.post('/upload', upload.single('video'), uploadVideo);

router.post('/trim', trimVideo);

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const videos = await Video.find({ userId }).sort({ createdAt: -1 });
    const editedCount = await Video.countDocuments({ userId, isEdited: true });

    res.json({
    videos,
    editedCount
});
  } catch (error) {
    console.error('Failed to fetch videos by user:', error.message);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

///api/videos/:shortId
router.get('/api/videos/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;

    const video = await Video.findOne({ shortId });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
