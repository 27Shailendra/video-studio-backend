import mongoose from 'mongoose';
import shortid from 'shortid';

const videoSchema = new mongoose.Schema({
  name: String,
  size: Number,
  type: String,
  url: String,
  duration: Number,
  shortId: {
    type: String,
    default: () => shortid.generate(),
    unique: true,
  },
  userId: { type: String, required: true },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
   aspectRatio: {
    type: String,
    default: "16:9",
  },
});

export default mongoose.model('Video', videoSchema);
