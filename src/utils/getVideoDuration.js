import { getVideoDurationInSeconds } from 'get-video-duration';
import { Readable } from 'stream';

export const getDuration = async (buffer) => {
  const stream = Readable.from(buffer);
  return await getVideoDurationInSeconds(stream);
};
