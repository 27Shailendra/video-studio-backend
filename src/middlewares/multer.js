import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'video/mp4') {
      cb(new Error('Only MP4 files allowed'), false);
    } else {
      cb(null, true);
    }
  },
});

export default upload;
