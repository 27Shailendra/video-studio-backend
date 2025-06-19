import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import shortid from 'shortid';
import dotenv from 'dotenv';
import Video from '../models/video.model.js';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadVideo = async (req, res) => {
  try {
    const file = req.file;
    const { userId } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const shortId = shortid.generate();
    const s3Key = `videos/${shortId}.mp4`;

      const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const videoDoc = await Video.create({
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      userId,
      s3Key,
      url: publicUrl,
      shortId,
    });

    res.status(201).json({
      message: 'Upload successful',
      video: videoDoc,
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: 'Upload failed' });
  }
};
