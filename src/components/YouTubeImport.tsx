import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Clock } from '@phosphor-icons/react';
import { Playlist, Song, YouTubePlaylistItem } from '@/lib/types';
import { parseYouTubePlaylist, extractPlaylistId } from '@/lib/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface YouTubeImportProps {
  playlists: Playlist[];
  onAddSongs: (songs: Song[], playlistId: string) => void;
  onCreatePlaylist: (name: string) => void;
}

export function YouTubeImport({
  playlists,
  onAddSongs,
  onCreatePlaylist,
}: YouTubeImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [targetPlaylistId, setTargetPlaylistId] = useState('');
  const [createNewPlaylist, setCreateNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [defaultStartTime, setDefaultStartTime] = useState('0:00');
  const [isLoading, setIsLoading] = useState(false);
  const [previewSongs, setPreviewSongs] = useState<YouTubePlaylistItem[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [importProgress, setImportProgress] = useState(0);

  const handleUrlChange = async (url: string) => {
    setPlaylistUrl(url);
    setPreviewSongs([]);
    setSelectedSongs(new Set());
    
    if (url.trim() && extractPlaylistId(url)) {
      setIsLoading(true);
      try {
        const songs = await parseYouTubePlaylist(url);
        setPreviewSongs(songs);
        setSelectedSongs(new Set(songs.map(s => s.id)));
        
        // Auto-generate playlist name from URL
        if (createNewPlaylist && !newPlaylistName) {
          setNewPlaylistName(`Imported Playlist ${Date.now().toString().slice(-4)}`);
        }
      } catch (error) {
        toast.error('Failed to load playlist. Please check the URL.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  const selectAllSongs = () => {
    setSelectedSongs(new Set(previewSongs.map(s => s.id)));
  };

  const deselectAllSongs = () => {
    setSelectedSongs(new Set());
  };

  const parseTimeString = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    const mins = parseInt(parts[0]) || 0;
    const secs = parseInt(parts[1]) || 0;
    return mins * 60 + secs;
  };

  const handleImport = async () => {
    if (selectedSongs.size === 0) {
      toast.error('Please select at least one song to import');
      return;
    }

    let finalPlaylistId = targetPlaylistId;

    // Create new playlist if needed
    if (createNewPlaylist) {
      if (!newPlaylistName.trim()) {
        toast.error('Please enter a playlist name');
        return;
      }
      
      const newPlaylist = {
        id: Date.now().toString(),
        name: newPlaylistName,
        songs: [],
      };
      
      onCreatePlaylist(newPlaylistName);
      finalPlaylistId = newPlaylist.id;
    }

    if (!finalPlaylistId) {
      toast.error('Please select a target playlist');
      return;
    }

    setIsLoading(true);
    setImportProgress(0);

    const songsToImport = previewSongs
      .filter(song => selectedSongs.has(song.id))
      .map((song, index): Song => {
        setImportProgress(((index + 1) / selectedSongs.size) * 100);
        
        return {
          id: `imported-${Date.now()}-${index}`,
          title: song.title,
          url: song.videoId,
          startTime: parseTimeString(defaultStartTime),
          thumbnail: song.thumbnail,
        };
      });

    try {
      onAddSongs(songsToImport, finalPlaylistId);
      toast.success(`Imported ${songsToImport.length} songs successfully`);
      
      // Reset form
      setPlaylistUrl('');
      setPreviewSongs([]);
      setSelectedSongs(new Set());
      setNewPlaylistName('');
      setCreateNewPlaylist(false);
      setTargetPlaylistId('');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to import songs');
    } finally {
      setIsLoading(false);
      setImportProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Download size={16} className="mr-2" />
          Import YouTube Playlist
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import YouTube Playlist</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="playlist-url">YouTube Playlist URL</Label>
            <Input
              id="playlist-url"
              value={playlistUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://youtube.com/playlist?list=..."
              disabled={isLoading}
            />
          </div>

          {/* Target Playlist Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Import to Playlist</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!createNewPlaylist}
                    onChange={() => setCreateNewPlaylist(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Existing Playlist</span>
                </label>
                {!createNewPlaylist && (
                  <Select value={targetPlaylistId} onValueChange={setTargetPlaylistId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select existing playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map(playlist => (
                        <SelectItem key={playlist.id} value={playlist.id}>
                          {playlist.name} ({playlist.songs.length} songs)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Or Create New</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={createNewPlaylist}
                    onChange={() => setCreateNewPlaylist(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">New Playlist</span>
                </label>
                {createNewPlaylist && (
                  <Input
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="New playlist name"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Default Start Time */}
          <div className="space-y-2">
            <Label htmlFor="default-start">Default Start Time (mm:ss)</Label>
            <Input
              id="default-start"
              value={defaultStartTime}
              onChange={(e) => setDefaultStartTime(e.target.value)}
              placeholder="0:00"
              className="w-24"
            />
          </div>

          {/* Loading State */}
          <AnimatePresence>
            {isLoading && importProgress === 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center py-4"
              >
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading playlist...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Import Progress */}
          <AnimatePresence>
            {importProgress > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Importing songs...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Song Preview */}
          <AnimatePresence>
            {previewSongs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Preview Songs</h3>
                    <Badge variant="outline">
                      {selectedSongs.size} of {previewSongs.length} selected
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllSongs}
                      disabled={selectedSongs.size === previewSongs.length}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deselectAllSongs}
                      disabled={selectedSongs.size === 0}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="max-h-64 overflow-auto border rounded-lg">
                  <div className="space-y-2 p-3">
                    {previewSongs.map((song) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-3 p-2 rounded border transition-colors cursor-pointer ${
                          selectedSongs.has(song.id)
                            ? 'bg-primary/10 border-primary/30'
                            : 'hover:bg-secondary/50'
                        }`}
                        onClick={() => toggleSongSelection(song.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSongs.has(song.id)}
                          onChange={() => toggleSongSelection(song.id)}
                          className="w-4 h-4"
                        />
                        
                        {song.thumbnail && (
                          <img
                            src={song.thumbnail}
                            alt={song.title}
                            className="w-12 h-9 object-cover rounded"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{song.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {song.duration && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                {song.duration}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://youtube.com/watch?v=${song.videoId}`, '_blank');
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink size={12} />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedSongs.size === 0 || isLoading || (!targetPlaylistId && !createNewPlaylist)}
          >
            Import {selectedSongs.size} Songs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}