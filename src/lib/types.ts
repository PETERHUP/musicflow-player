export interface Song {
  id: string;
  title: string;
  url: string;
  startTime: number; // in seconds
  duration?: number;
  thumbnail?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export interface PlaybackState {
  currentSong: Song | null;
  currentPlaylistId: string | null;
  isPlaying: boolean;
  currentTime: number;
  isShuffled: boolean;
  queue: Song[];
  queueIndex: number;
}

export const extractYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const parseTimeString = (timeStr: string): number => {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  const mins = parseInt(parts[0]) || 0;
  const secs = parseInt(parts[1]) || 0;
  return mins * 60 + secs;
};