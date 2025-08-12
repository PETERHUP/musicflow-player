import React, { useState, useCallback, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Toaster } from '@/components/ui/sonner';
import { CompactPlayer } from '@/components/CompactPlayer';
import { GroupButtons } from '@/components/GroupButtons';
import { SportsMusicManager } from '@/components/SportsMusicManager';
import { Song, Playlist, PlaybackState, GroupOrder } from '@/lib/types';
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
    
    setPlaylists(current => current ? [...current, newPlaylist] : [newPlaylist]);
  }, [setPlaylists]);

  const addSong = useCallback((song: Song, playlistId: string) => {
    setPlaylists(current => 
      current ? current.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, songs: [...playlist.songs, song] }
          : playlist
      ) : []
    );
  }, [setPlaylists]);

  const deleteSong = useCallback((songId: string, playlistId: string) => {
    setPlaylists(current => 
      current ? current.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, songs: playlist.songs.filter(s => s.id !== songId) }
          : playlist
      ) : []
    );

    // If the deleted song is currently playing, reset playback
    if (playbackState?.currentSong?.id === songId) {
      setPlaybackState(current => current ? ({
        ...current,
        currentSong: null,
        isPlaying: false,
        queue: current.queue.filter(s => s.id !== songId),
      }) : {
        currentSong: null,
        currentPlaylistId: null,
        isPlaying: false,
        currentTime: 0,
        isShuffled: false,
        queue: [],
        queueIndex: 0,
      });
    }
  }, [setPlaylists, playbackState?.currentSong?.id, setPlaybackState]);

  const playGroup = useCallback((playlistId: string, shuffled = false) => {
    const playlist = playlists?.find(p => p.id === playlistId);
    if (!playlist || playlist.songs.length === 0) return;

    // If this is the current playlist, advance to next song
    if (playbackState?.currentPlaylistId === playlistId && playbackState.queue.length > 0) {
      const nextIndex = (playbackState.queueIndex + 1) % playbackState.queue.length;
      const nextSong = playbackState.queue[nextIndex];
      
      setPlaybackState(current => current ? ({
        ...current,
        currentSong: nextSong,
        queueIndex: nextIndex,
        isPlaying: true,
      }) : {
        currentSong: nextSong,
        currentPlaylistId: playlistId,
        isPlaying: true,
        currentTime: 0,
        isShuffled: shuffled,
        queue: [nextSong],
        queueIndex: 0,
      });
      return;
    }

    // Otherwise start new queue
    const queue = shuffled ? shuffleArray(playlist.songs) : playlist.songs;
    
    setPlaybackState(current => ({
      currentSong: queue[0],
      currentPlaylistId: playlistId,
      queue,
      queueIndex: 0,
      isPlaying: true,
      isShuffled: shuffled,
      currentTime: 0,
    }));
  }, [playlists, playbackState?.currentPlaylistId, playbackState?.queue, playbackState?.queueIndex, setPlaybackState]);

  const togglePlay = useCallback(() => {
    setPlaybackState(current => current ? ({
      ...current,
      isPlaying: !current.isPlaying,
    }) : {
      currentSong: null,
      currentPlaylistId: null,
      isPlaying: false,
      currentTime: 0,
      isShuffled: false,
      queue: [],
      queueIndex: 0,
    });
  }, [setPlaybackState]);

  const stopPlayback = useCallback(() => {
    setPlaybackState({
      isPlaying: false,
      currentSong: null,
      currentPlaylistId: null,
      queue: [],
      queueIndex: 0,
      currentTime: 0,
      isShuffled: false,
    });
  }, [setPlaybackState]);

  const handleSongEnd = useCallback(() => {
    if (!playbackState?.queue || playbackState.queue.length === 0) return;
    
    const nextIndex = (playbackState.queueIndex + 1) % playbackState.queue.length;
    const nextSong = playbackState.queue[nextIndex];
    
    setPlaybackState(current => current ? ({
      ...current,
      currentSong: nextSong,
      queueIndex: nextIndex,
      isPlaying: true,
    }) : {
      currentSong: nextSong,
      currentPlaylistId: null,
      isPlaying: true,
      currentTime: 0,
      isShuffled: false,
      queue: [nextSong],
      queueIndex: 0,
    });
  }, [playbackState?.queue, playbackState?.queueIndex, setPlaybackState]);

  const updateCurrentTime = useCallback((time: number) => {
    setPlaybackState(current => current ? ({
      ...current,
      currentTime: time,
    }) : {
      currentSong: null,
      currentPlaylistId: null,
      isPlaying: false,
      currentTime: time,
      isShuffled: false,
      queue: [],
      queueIndex: 0,
    });
  }, [setPlaybackState]);

  const reorderGroups = useCallback((newOrder: Playlist[]) => {
    setPlaylists(newOrder);
  }, [setPlaylists]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-4 max-w-7xl"
      >
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-center mb-2">Sports Music Controller</h1>
          <p className="text-muted-foreground text-center text-sm">
            Quick access music groups for game events • Drag to reorder • Click to play next song
          </p>
        </motion.header>

        {/* Compact Player - Top */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <CompactPlayer
            currentSong={playbackState?.currentSong || null}
            isPlaying={playbackState?.isPlaying || false}
            onPlay={togglePlay}
            onPause={togglePlay}
            onStop={stopPlayback}
            onEnded={handleSongEnd}
            onTimeUpdate={updateCurrentTime}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Group Buttons */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GroupButtons
              playlists={playlists || []}
              currentPlaylistId={playbackState?.currentPlaylistId || null}
              currentSong={playbackState?.currentSong || null}
              onPlayGroup={playGroup}
              onReorderGroups={reorderGroups}
            />
          </motion.div>

          {/* Right Column - Music Manager */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SportsMusicManager
              playlists={playlists || []}
              onAddSong={addSong}
              onCreatePlaylist={createPlaylist}
              onDeleteSong={deleteSong}
            />
          </motion.div>
        </div>
      </motion.div>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;