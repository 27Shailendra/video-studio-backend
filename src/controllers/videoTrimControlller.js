import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
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

const parseAspectRatio = (aspectRatio) => {
  const [w, h] = aspectRatio.split(':').map(Number);
  return w && h ? { w, h } : { w: 1, h: 1 };
};

export const trimVideo = async (req, res) => {
  try {
    const { url, startTime, endTime, userId, name, aspectRatio } = req.body;
    if (!url || startTime === undefined || !endTime || !userId || !name || !aspectRatio) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tmpInputPath = path.join(os.tmpdir(), `input-${shortid.generate()}.mp4`);
    const tmpTrimmedPath = path.join(os.tmpdir(), `trimmed-${shortid.generate()}.mp4`);
    const tmpOutputPath = path.join(os.tmpdir(), `output-${shortid.generate()}.mp4`);

    const downloadRes = await fetch(url);
    const fileBuffer = await downloadRes.arrayBuffer();
    fs.writeFileSync(tmpInputPath, Buffer.from(fileBuffer));

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', tmpInputPath,
        '-ss', startTime.toString(),
        '-to', endTime.toString(),
        '-c', 'copy',
        tmpTrimmedPath
      ]);

      ffmpeg.stderr.on('data', (data) => console.log(data.toString()));
      ffmpeg.on('error', reject);
      ffmpeg.on('close', (code) => code === 0 ? resolve() : reject(new Error('Trimming failed')));
    });

    const dimensions = await new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height',
        '-of', 'json',
        tmpTrimmedPath,
      ]);

      let output = '';
      ffprobe.stdout.on('data', (data) => output += data);
      ffprobe.on('error', reject);
      ffprobe.on('close', () => {
        const info = JSON.parse(output);
        const { width, height } = info.streams[0];
        resolve({ width, height });
      });
    });

    const { w: arW, h: arH } = parseAspectRatio(aspectRatio);
    const inputW = dimensions.width;
    const inputH = dimensions.height;

    const inputRatio = inputW / inputH;
    const targetRatio = arW / arH;

    let cropW = inputW;
    let cropH = inputH;

    if (inputRatio > targetRatio) {
      cropW = Math.floor(inputH * targetRatio);
    } else if (inputRatio < targetRatio) {
      cropH = Math.floor(inputW / targetRatio);
    }

    const offsetX = Math.floor((inputW - cropW) / 2);
    const offsetY = Math.floor((inputH - cropH) / 2);

    const cropFilter = `crop=${cropW}:${cropH}:${offsetX}:${offsetY}`;

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', tmpTrimmedPath,
        '-vf', cropFilter,
        '-c:a', 'copy',
        tmpOutputPath,
      ]);

      ffmpeg.stderr.on('data', (data) => console.log(data.toString()));
      ffmpeg.on('error', reject);
      ffmpeg.on('close', (code) => code === 0 ? resolve() : reject(new Error('Cropping failed')));
    });

    const trimmedBuffer = fs.readFileSync(tmpOutputPath);
    const shortId = shortid.generate();
    const s3Key = `videos/${shortId}.mp4`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: trimmedBuffer,
      ContentType: 'video/mp4',
    }));

    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    const stats = fs.statSync(tmpOutputPath);

    const trimmedVideo = await Video.create({
      name,
      size: stats.size,
      type: 'video/mp4',
      uploadDate: new Date(),
      userId,
      url: publicUrl,
      shortId,
      aspectRatio,
      isEdited: true,
    });

    fs.unlinkSync(tmpInputPath);
    fs.unlinkSync(tmpTrimmedPath);
    fs.unlinkSync(tmpOutputPath);

    res.status(201).json({ message: 'Video generate successfully', success: true, video: trimmedVideo });
  } catch (err) {
    console.error('Trim error:', err);
    res.status(500).json({ error: 'Video edit failed' });
  }
};
