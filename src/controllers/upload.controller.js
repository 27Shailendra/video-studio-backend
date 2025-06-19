const { uploadFileToS3 } = require('../services/s3.service');

const uploadVideo = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const s3Url = await uploadFileToS3(file);

    return res.status(200).json({ message: 'Upload successful', url: s3Url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
};

module.exports = { uploadVideo };
