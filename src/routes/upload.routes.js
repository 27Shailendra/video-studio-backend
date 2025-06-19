const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../services/s3');

const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `videos/${Date.now()}-${file.originalname}`);
    },
  }),
});

router.post('/upload', upload.single('video'), (req, res) => {
  res.json({ url: req.file.location });
});

module.exports = router;
