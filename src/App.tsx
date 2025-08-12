import React, { useState, useCallback, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Toaster } from '@/components/ui/sonner';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { AddSongPanel } from '@/components/AddSongPanel';
import { PlaybackControls } from '@/components/PlaybackControls';
import { PlaylistManager } from '@/components/PlaylistManager';
import { Song, Playlist, PlaybackState } from '@/lib/types';
import { motion } from 'framer-motion';

function App() {
  const [playlists, setPlaylists] = useKV<Playlist[]>('music-playlists', []);
  const [playbackState, setPlaybackState] = useKV<PlaybackState>('playback-state', {
    currentSong: null,
    currentPlaylistId: null,
    isPlaying: false,
    currentTime: 0,
    isShuffled: false,
    queue: [],
    queueIndex: 0,
  });

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    if (playlists.length > 0 && !selectedPlaylistId) {
      setSelectedPlaylistId(playlists[0].id);
    }
  }, [playlists, selectedPlaylistId]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const createPlaylist = useCallback((name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
    };
    
    setPlaylists(current => [...current, newPlaylist]);
    setSelectedPlaylistId(newPlaylist.id);
  }, [setPlaylists]);

  const addSong = useCallback((song: Song, playlistId: string) => {
    setPlaylists(current => 
      current.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, songs: [...playlist.songs, song] }
          : playlist
      )
    );
  }, [setPlaylists]);

  const deleteSong = useCallback((songId: string, playlistId: string) => {
    setPlaylists(current => 
      current.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, songs: playlist.songs.filter(s => s.id !== songId) }
          : playlist
      )
    );

    if (playbackState.currentSong?.id === songId) {
      setPlaybackState(current => ({
        ...current,
        currentSong: null,
        isPlaying: false,
        queue: current.queue.filter(s => s.id !== songId),
      }));
    }
  }, [setPlaylists, playbackState.currentSong?.id, setPlaybackState]);

  const playPlaylist = useCallback((playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || playlist.songs.length === 0) return;

    const queue = playbackState.isShuffled ? shuffleArray(playlist.songs) : playlist.songs;
    
    setPlaybackState(current => ({
      ...current,
      currentSong: queue[0],
      currentPlaylistId: playlistId,
      queue,
      queueIndex: 0,
      isPlaying: true,
    }));
  }, [playlists, playbackState.isShuffled, setPlaybackState]);

  const playSong = useCallback((song: Song, playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const queue = playbackState.isShuffled ? shuffleArray(playlist.songs) : playlist.songs;
    const songIndex = queue.findIndex(s => s.id === song.id);
    
    setPlaybackState(current => ({
      ...current,
      currentSong: song,
      currentPlaylistId: playlistId,
      queue,
      queueIndex: songIndex,
      isPlaying: true,
    }));
  }, [playlists, playbackState.isShuffled, setPlaybackState]);

  const selectSong = useCallback((song: Song) => {
    const songIndex = playbackState.queue.findIndex(s => s.id === song.id);
    
    setPlaybackState(current => ({
      ...current,
      currentSong: song,
      queueIndex: songIndex,
      isPlaying: true,
    }));
  }, [playbackState.queue, setPlaybackState]);

  const playNext = useCallback(() => {
    if (playbackState.queue.length === 0) return;
    
    const nextIndex = (playbackState.queueIndex + 1) % playbackState.queue.length;
    const nextSong = playbackState.queue[nextIndex];
    
    setPlaybackState(current => ({
      ...current,
      currentSong: nextSong,
      queueIndex: nextIndex,
      isPlaying: true,
    }));
  }, [playbackState.queue, playbackState.queueIndex, setPlaybackState]);

  const togglePlay = useCallback(() => {
    setPlaybackState(current => ({
      ...current,
      isPlaying: !current.isPlaying,
    }));
  }, [setPlaybackState]);

  const toggleShuffle = useCallback(() => {
    setPlaybackState(current => {
      const newShuffled = !current.isShuffled;
      
      if (current.currentPlaylistId) {
        const playlist = playlists.find(p => p.id === current.currentPlaylistId);
        if (playlist) {
          const newQueue = newShuffled ? shuffleArray(playlist.songs) : playlist.songs;
          const currentSongIndex = newQueue.findIndex(s => s.id === current.currentSong?.id);
          
          return {
            ...current,
            isShuffled: newShuffled,
            queue: newQueue,
            queueIndex: currentSongIndex >= 0 ? currentSongIndex : 0,
          };
        }
      }
      
      return {
        ...current,
        isShuffled: newShuffled,
      };
    });
  }, [setPlaybackState, playlists]);

  const reorderQueue = useCallback((newQueue: Song[]) => {
    const currentSong = playbackState.currentSong;
    const newIndex = currentSong ? newQueue.findIndex(s => s.id === currentSong.id) : 0;
    
    setPlaybackState(current => ({
      ...current,
      queue: newQueue,
      queueIndex: newIndex >= 0 ? newIndex : 0,
    }));
  }, [playbackState.currentSong, setPlaybackState]);

  const updateCurrentTime = useCallback((time: number) => {
    setPlaybackState(current => ({
      ...current,
      currentTime: time,
    }));
  }, [setPlaybackState]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-6"
      >
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-center mb-2">YouTube Music Player</h1>
          <p className="text-muted-foreground text-center">
            Create playlists with custom start times and seamless playback
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Playlist Manager */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <PlaylistManager
              playlists={playlists}
              selectedPlaylistId={selectedPlaylistId}
              currentSong={playbackState.currentSong}
              onSelectPlaylist={setSelectedPlaylistId}
              onPlayPlaylist={playPlaylist}
              onPlaySong={playSong}
              onDeleteSong={deleteSong}
            />
          </motion.div>

          {/* Middle Column - Player and Controls */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-card rounded-lg p-6 border">
              <YouTubePlayer
                song={playbackState.currentSong}
                isPlaying={playbackState.isPlaying}
                onEnded={playNext}
                onReady={() => {}}
                onTimeUpdate={updateCurrentTime}
              />
            </div>

            <PlaybackControls
              currentSong={playbackState.currentSong}
              isPlaying={playbackState.isPlaying}
              isShuffled={playbackState.isShuffled}
              queue={playbackState.queue}
              currentTime={playbackState.currentTime}
              onPlay={() => togglePlay()}
              onPause={() => togglePlay()}
              onNext={playNext}
              onToggleShuffle={toggleShuffle}
              onReorderQueue={reorderQueue}
              onSelectSong={selectSong}
            />
          </motion.div>

          {/* Right Column - Add Song Panel */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <AddSongPanel
              playlists={playlists}
              selectedPlaylistId={selectedPlaylistId}
              onAddSong={addSong}
              onCreatePlaylist={createPlaylist}
              onSelectPlaylist={setSelectedPlaylistId}
            />
          </motion.div>
        </div>
      </motion.div>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;