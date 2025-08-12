import React, { useState, useCallback, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Toaster } from '@/components/ui/sonner';
import { CompactPlayer } from '@/components/CompactPlayer';
import { GroupCards } from '@/components/GroupCards';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { EditableGrid } from '@/components/EditableGrid';
import { PlaylistForm } from '@/components/PlaylistForm';
import { Song, Playlist, PlaybackState, LayoutSettings, AppSettings } from '@/lib/types';
import { defaultPlaylists } from '@/lib/defaultSongs';
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
  const [appSettings, setAppSettings] = useKV<AppSettings>('app-settings', {
    layout: {
      cardsPerRow: 3,
      cardSize: 'small', // Make cards smaller by default
      showSongCount: true,
      showCurrentSong: true,
    },
  });
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [playlistFormId, setPlaylistFormId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with default playlists if none exist and ensure backward compatibility
  useEffect(() => {
    if (!isInitialized && playlists !== undefined) {
      if (!playlists || playlists.length === 0) {
        setPlaylists(defaultPlaylists);
      } else {
        // Migrate existing playlists to ensure they have playedSongs array
        const updatedPlaylists = playlists.map(playlist => ({
          ...playlist,
          playedSongs: playlist.playedSongs || [],
          image: playlist.image || '🎵'
        }));
        if (JSON.stringify(updatedPlaylists) !== JSON.stringify(playlists)) {
          setPlaylists(updatedPlaylists);
        }
      }
      setIsInitialized(true);
    }
  }, [playlists, setPlaylists, isInitialized]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const createPlaylist = useCallback((name: string, image?: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
      image,
      playedSongs: [],
    };
    
    setPlaylists(current => current ? [...current, newPlaylist] : [newPlaylist]);
  }, [setPlaylists]);

  const addSongs = useCallback((songs: Song[], playlistId: string) => {
    setPlaylists(current => 
      current ? current.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, songs: [...playlist.songs, ...songs] }
          : playlist
      ) : []
    );
  }, [setPlaylists]);

  const updateSongs = useCallback((playlistId: string, updatedSongs: Song[]) => {
    setPlaylists(current => 
      current ? current.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, songs: updatedSongs }
          : playlist
      ) : []
    );
  }, [setPlaylists]);

  const addSong = useCallback((song: Song, playlistId: string) => {
    addSongs([song], playlistId);
  }, [addSongs]);

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

  const playSpecificSong = useCallback((song: Song, playlistId: string) => {
    const playlist = playlists?.find(p => p.id === playlistId);
    if (!playlist) return;

    // Create a queue with just this song
    setPlaybackState({
      currentSong: song,
      currentPlaylistId: playlistId,
      queue: [song],
      queueIndex: 0,
      isPlaying: true,
      isShuffled: false,
      currentTime: 0,
    });
  }, [playlists, setPlaybackState]);

  const playGroup = useCallback((playlistId: string, shuffled = false) => {
    const playlist = playlists?.find(p => p.id === playlistId);
    if (!playlist || playlist.songs.length === 0) return;

    // If this is the current playlist, advance to next song
    if (playbackState?.currentPlaylistId === playlistId && playbackState.queue.length > 0) {
      const nextIndex = (playbackState.queueIndex + 1) % playbackState.queue.length;
      const nextSong = playbackState.queue[nextIndex];
      
      // Mark current song as played
      if (playbackState.currentSong) {
        setPlaylists(current => 
          current ? current.map(p => 
            p.id === playlistId 
              ? { 
                  ...p, 
                  playedSongs: [...(p.playedSongs || []), playbackState.currentSong!.id].filter((id, index, arr) => arr.indexOf(id) === index)
                } 
              : p
          ) : []
        );
      }
      
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

    // Reset played songs if all have been played
    const unplayedSongs = playlist.songs.filter(song => !playlist.playedSongs?.includes(song.id));
    let songsToPlay = unplayedSongs.length > 0 ? unplayedSongs : playlist.songs;
    
    // If we reset the playlist, clear played songs
    if (unplayedSongs.length === 0) {
      setPlaylists(current => 
        current ? current.map(p => 
          p.id === playlistId ? { ...p, playedSongs: [] } : p
        ) : []
      );
    }

    // Otherwise start new queue
    const queue = shuffled ? shuffleArray(songsToPlay) : songsToPlay;
    
    setPlaybackState(current => ({
      currentSong: queue[0],
      currentPlaylistId: playlistId,
      queue,
      queueIndex: 0,
      isPlaying: true,
      isShuffled: shuffled,
      currentTime: 0,
    }));
  }, [playlists, playbackState?.currentPlaylistId, playbackState?.queue, playbackState?.queueIndex, playbackState?.currentSong, setPlaybackState, setPlaylists]);

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
    
    // Mark current song as played
    if (playbackState.currentSong && playbackState.currentPlaylistId) {
      setPlaylists(current => 
        current ? current.map(p => 
          p.id === playbackState.currentPlaylistId 
            ? { 
                ...p, 
                playedSongs: [...(p.playedSongs || []), playbackState.currentSong!.id].filter((id, index, arr) => arr.indexOf(id) === index)
              } 
            : p
        ) : []
      );
    }
    
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
  }, [playbackState?.queue, playbackState?.queueIndex, playbackState?.currentSong, playbackState?.currentPlaylistId, setPlaybackState, setPlaylists]);

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

  const updatePlaylist = useCallback((updatedPlaylist: Playlist) => {
    setPlaylists(current => 
      current ? current.map(playlist => 
        playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist
      ) : []
    );
  }, [setPlaylists]);

  const reorderGroups = useCallback((newOrder: Playlist[]) => {
    setPlaylists(newOrder);
  }, [setPlaylists]);

  const handleLayoutChange = useCallback((newLayout: LayoutSettings) => {
    setAppSettings(current => ({
      ...current,
      layout: newLayout,
    }));
  }, [setAppSettings]);

  const handleEditGroup = useCallback((playlistId: string) => {
    setEditingPlaylistId(playlistId);
  }, []);

  const handleLongPressGroup = useCallback((playlistId: string) => {
    setPlaylistFormId(playlistId);
  }, []);

  const closeEditGrid = useCallback(() => {
    setEditingPlaylistId(null);
  }, []);

  const closePlaylistForm = useCallback(() => {
    setPlaylistFormId(null);
  }, []);

  const editingPlaylist = editingPlaylistId 
    ? playlists?.find(p => p.id === editingPlaylistId) 
    : null;

  const playlistFormPlaylist = playlistFormId 
    ? playlists?.find(p => p.id === playlistFormId) 
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hamburger Menu */}
      <HamburgerMenu
        playlists={playlists || []}
        onAddSong={addSong}
        onAddSongs={addSongs}
        onCreatePlaylist={createPlaylist}
        onDeleteSong={deleteSong}
        onUpdatePlaylist={updatePlaylist}
      />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-4 max-w-6xl"
      >
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 ml-12" // Add left margin for hamburger menu
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-4xl bg-gradient-to-br from-accent to-primary rounded-lg p-2 shadow-lg">🎧</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GameDay Beats</h1>
          </div>
          <p className="text-muted-foreground text-center text-sm">
            Quick access music groups for game events • Click cards to play next song • Long press for playlist editor • Drag to reorder
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

        {/* Music Group Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GroupCards
            playlists={playlists || []}
            currentPlaylistId={playbackState?.currentPlaylistId || null}
            currentSong={playbackState?.currentSong || null}
            layoutSettings={appSettings?.layout || {
              cardsPerRow: 3,
              cardSize: 'small',
              showSongCount: true,
              showCurrentSong: true,
            }}
            onPlayGroup={playGroup}
            onReorderGroups={reorderGroups}
            onLayoutChange={handleLayoutChange}
            onEditGroup={handleEditGroup}
            onLongPressGroup={handleLongPressGroup}
          />
        </motion.div>

        {/* Editable Grid Modal */}
        {editingPlaylist && (
          <EditableGrid
            playlist={editingPlaylist}
            isOpen={!!editingPlaylistId}
            onClose={closeEditGrid}
            onUpdateSongs={updateSongs}
            onAddSong={addSong}
            onDeleteSong={deleteSong}
          />
        )}

        {/* Playlist Form Modal */}
        {playlistFormPlaylist && (
          <PlaylistForm
            playlist={playlistFormPlaylist}
            isOpen={!!playlistFormId}
            onClose={closePlaylistForm}
            onUpdateSongs={updateSongs}
            onAddSong={addSong}
            onDeleteSong={deleteSong}
            onPlaySong={playSpecificSong}
          />
        )}
      </motion.div>

      {/* Copyright Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 pb-6 text-center text-xs text-muted-foreground border-t border-border/30 pt-4"
      >
        <p>Copyright © 2025 CViewsIt ® All rights reserved</p>
      </motion.footer>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;