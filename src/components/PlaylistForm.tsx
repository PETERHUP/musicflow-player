import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowUp, ArrowDown, Pencil, Trash2, Play, Clock } from '@phosphor-icons/react';
import { Playlist, Song } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface PlaylistFormProps {
  playlist: Playlist;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSongs: (playlistId: string, songs: Song[]) => void;
  onAddSong: (song: Song, playlistId: string) => void;
  onDeleteSong: (songId: string, playlistId: string) => void;
}

interface EditingSong {
  song: Song;
  isEditing: boolean;
}

export function PlaylistForm({
  playlist,
  isOpen,
  onClose,
  onUpdateSongs,
  onAddSong,
  onDeleteSong,
}: PlaylistFormProps) {
  const [editingSongs, setEditingSongs] = useState<EditingSong[]>([]);
  const [newSong, setNewSong] = useState({
    title: '',
    url: '',
    startTime: 0,
    customName: '',
  });
  const [editingNewSong, setEditingNewSong] = useState(false);

  // Initialize editing songs when playlist changes
  React.useEffect(() => {
    if (playlist?.songs) {
      setEditingSongs(playlist.songs.map(song => ({ song, isEditing: false })));
    }
  }, [playlist?.songs]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1] || '0');
    }
    return parseInt(timeStr) || 0;
  };

  const moveSong = (index: number, direction: 'up' | 'down') => {
    const newSongs = [...editingSongs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSongs.length) {
      [newSongs[index], newSongs[targetIndex]] = [newSongs[targetIndex], newSongs[index]];
      setEditingSongs(newSongs);
      onUpdateSongs(playlist.id, newSongs.map(item => item.song));
    }
  };

  const toggleEdit = (index: number) => {
    setEditingSongs(prev => prev.map((item, i) => 
      i === index ? { ...item, isEditing: !item.isEditing } : item
    ));
  };

  const updateSong = (index: number, field: keyof Song, value: any) => {
    setEditingSongs(prev => prev.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            song: { ...item.song, [field]: value }
          } 
        : item
    ));
  };

  const saveSongEdit = (index: number) => {
    toggleEdit(index);
    onUpdateSongs(playlist.id, editingSongs.map(item => item.song));
  };

  const handleDeleteSong = (songId: string, index: number) => {
    setEditingSongs(prev => prev.filter((_, i) => i !== index));
    onDeleteSong(songId, playlist.id);
  };

  const handleAddNewSong = () => {
    if (!newSong.title.trim() || !newSong.url.trim()) return;

    const song: Song = {
      id: Date.now().toString(),
      title: newSong.title,
      url: newSong.url,
      startTime: newSong.startTime,
      customName: newSong.customName || newSong.title,
    };

    onAddSong(song, playlist.id);
    setNewSong({ title: '', url: '', startTime: 0, customName: '' });
    setEditingNewSong(false);
  };

  const isYouTubeUrl = (url: string): boolean => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{playlist.image || '🎵'}</span>
            <div>
              <h2 className="text-xl font-bold">{playlist.name}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {playlist.songs.length} songs
                </Badge>
                <span>•</span>
                <span>Long press to edit • Drag to reorder</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Add New Song Section */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add New Song</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingNewSong(!editingNewSong)}
              >
                <Plus size={16} className="mr-2" />
                {editingNewSong ? 'Cancel' : 'Add Song'}
              </Button>
            </div>

            <AnimatePresence>
              {editingNewSong && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="text-sm font-medium mb-1 block">Song Title</label>
                    <Input
                      placeholder="Enter song title"
                      value={newSong.title}
                      onChange={(e) => setNewSong(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Custom Name (Optional)</label>
                    <Input
                      placeholder="Display name for this song"
                      value={newSong.customName}
                      onChange={(e) => setNewSong(prev => ({ ...prev, customName: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">YouTube URL</label>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newSong.url}
                      onChange={(e) => setNewSong(prev => ({ ...prev, url: e.target.value }))}
                      className={newSong.url && !isYouTubeUrl(newSong.url) ? 'border-destructive' : ''}
                    />
                    {newSong.url && !isYouTubeUrl(newSong.url) && (
                      <p className="text-xs text-destructive mt-1">Please enter a valid YouTube URL</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Start Time (MM:SS)</label>
                    <Input
                      placeholder="0:00"
                      value={formatTime(newSong.startTime)}
                      onChange={(e) => setNewSong(prev => ({ 
                        ...prev, 
                        startTime: parseTime(e.target.value) 
                      }))}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={handleAddNewSong}
                      disabled={!newSong.title.trim() || !newSong.url.trim() || !isYouTubeUrl(newSong.url)}
                      className="w-full"
                    >
                      Add Song
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Songs List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="font-semibold mb-4">Songs ({editingSongs.length})</h3>
              
              {editingSongs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No songs in this playlist yet</p>
                  <p className="text-sm">Add your first song above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {editingSongs.map((item, index) => (
                    <motion.div
                      key={item.song.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-card border rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* Move Up/Down Controls */}
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSong(index, 'up')}
                            disabled={index === 0}
                            className="h-7 w-7 p-0"
                          >
                            <ArrowUp size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSong(index, 'down')}
                            disabled={index === editingSongs.length - 1}
                            className="h-7 w-7 p-0"
                          >
                            <ArrowDown size={14} />
                          </Button>
                        </div>

                        {/* Song Content */}
                        <div className="flex-1 min-w-0">
                          {item.isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Title</label>
                                <Input
                                  value={item.song.title}
                                  onChange={(e) => updateSong(index, 'title', e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Custom Name</label>
                                <Input
                                  value={item.song.customName || ''}
                                  onChange={(e) => updateSong(index, 'customName', e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Start Time</label>
                                <Input
                                  value={formatTime(item.song.startTime)}
                                  onChange={(e) => updateSong(index, 'startTime', parseTime(e.target.value))}
                                  className="h-8"
                                />
                              </div>
                              <div className="md:col-span-3">
                                <label className="text-xs font-medium text-muted-foreground">URL</label>
                                <Input
                                  value={item.song.url}
                                  onChange={(e) => updateSong(index, 'url', e.target.value)}
                                  className="h-8"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {item.song.customName || item.song.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  <Clock size={12} className="mr-1" />
                                  {formatTime(item.song.startTime)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.song.title !== (item.song.customName || item.song.title) && item.song.title}
                              </p>
                              <a 
                                href={item.song.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:underline truncate block"
                              >
                                {item.song.url}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1">
                          {item.isEditing ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => saveSongEdit(index)}
                              className="h-8 px-3"
                            >
                              Save
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleEdit(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil size={14} />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSong(item.song.id, index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {editingSongs.length} songs • Click and hold cards for quick access
            </div>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}