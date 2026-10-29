import type { VideoSource } from 'expo-video';
import { VIDEO_COUNT } from './config';

// Metro needs every asset path written out literally, so this list can't be generated.
// Files live in assets/videos/File1.MP4 ... File20.MP4
export const VIDEOS: VideoSource[] = [
  require('../assets/videos/File1.MOV'),
  require('../assets/videos/File2.MP4'),
  require('../assets/videos/File3.MP4'),
  require('../assets/videos/File4.MP4'),
  require('../assets/videos/File5.MP4'),
  require('../assets/videos/File6.MP4'),
  require('../assets/videos/File7.MP4'),
  require('../assets/videos/File8.MP4'),
  require('../assets/videos/File9.MP4'),
  require('../assets/videos/File10.MP4'),
  require('../assets/videos/File11.MP4'),
  require('../assets/videos/File12.MP4'),
  require('../assets/videos/File13.MP4'),
  require('../assets/videos/File14.MP4'),
  require('../assets/videos/File15.MP4'),
  require('../assets/videos/File16.MP4'),
  require('../assets/videos/File17.MP4'),
  require('../assets/videos/File18.MP4'),
  require('../assets/videos/File19.MP4'),
  require('../assets/videos/File20.MP4'),
];

if (__DEV__ && VIDEOS.length !== VIDEO_COUNT) {
  console.warn(`VIDEO_COUNT (${VIDEO_COUNT}) doesn't match VIDEOS.length (${VIDEOS.length})`);
}

/** Feed position -> video. Loops if the limit is larger than the number of videos. */
export const videoFor = (index: number): VideoSource => VIDEOS[index % VIDEOS.length];

/** Dark per-item tint shown behind a video while it loads. */
export const tintFor = (index: number) => `hsl(${(index * 47) % 360}, 38%, 16%)`;
