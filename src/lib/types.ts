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
  image?: string;
  playedSongs: string[]; // Track which songs have been played in current session
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

export interface GroupOrder {
  id: string;
  position: number;
}

export interface LayoutSettings {
  cardsPerRow: number;
  cardSize: 'small' | 'medium' | 'large';
  showSongCount: boolean;
  showCurrentSong: boolean;
}

export interface AppSettings {
  layout: LayoutSettings;
}

export interface YouTubePlaylistItem {
  id: string;
  title: string;
  videoId: string;
  thumbnail?: string;
  duration?: string;
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

export const extractPlaylistId = (url: string): string | null => {
  const regex = /[?&]list=([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Mock function for YouTube playlist parsing (would need YouTube API in real implementation)
export const parseYouTubePlaylist = async (playlistUrl: string): Promise<YouTubePlaylistItem[]> => {
  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) throw new Error('Invalid YouTube playlist URL');
  
  // This would use the YouTube API in a real implementation
  // For now, we'll return mock data
  return [
    {
      id: 'mock1',
      title: 'Song 1 from Playlist',
      videoId: 'dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      duration: '3:32'
    },
    {
      id: 'mock2', 
      title: 'Song 2 from Playlist',
      videoId: 'jNQXAC9IVRw',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg',
      duration: '4:15'
    }
  ];
};