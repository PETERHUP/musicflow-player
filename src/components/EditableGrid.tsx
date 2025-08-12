import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash, Plus, Save, X, ExternalLink } from '@phosphor-icons/react';
import { Song, Playlist } from '@/lib/types';
import { extractYouTubeId, parseTimeString, formatTime } from '@/lib/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface EditableGridProps {
  playlist: Playlist;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSongs: (playlistId: string, songs: Song[]) => void;
  onAddSong: (song: Song, playlistId: string) => void;
  onDeleteSong: (songId: string, playlistId: string) => void;
}

interface EditingSong extends Song {
  isEditing?: boolean;
  tempTitle?: string;
  tempUrl?: string;
  tempStartTime?: string;
}

export function EditableGrid({
  playlist,
  isOpen,
  onClose,
  onUpdateSongs,
  onAddSong,
  onDeleteSong,
}: EditableGridProps) {
  const [songs, setSongs] = useState<EditingSong[]>([]);
  const [newSong, setNewSong] = useState({
    title: '',
    url: '',
    startTime: '0:00'
  });

  useEffect(() => {
    setSongs(playlist.songs.map(song => ({ ...song, isEditing: false })));
  }, [playlist.songs]);

  const startEditing = (songId: string) => {
    setSongs(current => 
      current.map(song => 
        song.id === songId 
          ? { 
              ...song, 
              isEditing: true,
              tempTitle: song.title,
              tempUrl: `https://youtube.com/watch?v=${song.url}`,
              tempStartTime: formatTime(song.startTime)
            }
          : { ...song, isEditing: false }
      )
    );
  };

  const cancelEditing = (songId: string) => {
    setSongs(current => 
      current.map(song => 
        song.id === songId 
          ? { ...song, isEditing: false, tempTitle: undefined, tempUrl: undefined, tempStartTime: undefined }
          : song
      )
    );
  };

  const saveEditing = (songId: string) => {
    const song = songs.find(s => s.id === songId);
    if (!song || !song.tempTitle || !song.tempUrl) return;

    const videoId = extractYouTubeId(song.tempUrl);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    const updatedSongs = songs.map(s => 
      s.id === songId 
        ? {
            ...s,
            title: song.tempTitle!,
            url: videoId,
            startTime: parseTimeString(song.tempStartTime || '0:00'),
            isEditing: false,
            tempTitle: undefined,
            tempUrl: undefined,
            tempStartTime: undefined
          }
        : s
    );

    setSongs(updatedSongs);
    onUpdateSongs(playlist.id, updatedSongs);
    toast.success('Song updated');
  };

  const updateTempField = (songId: string, field: 'tempTitle' | 'tempUrl' | 'tempStartTime', value: string) => {
    setSongs(current => 
      current.map(song => 
        song.id === songId ? { ...song, [field]: value } : song
      )
    );
  };

  const handleAddNewSong = () => {
    if (!newSong.title.trim() || !newSong.url.trim()) {
      toast.error('Please enter both title and URL');
      return;
    }

    const videoId = extractYouTubeId(newSong.url);
    if (!videoId) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    const song: Song = {
      id: Date.now().toString(),
      title: newSong.title,
      url: videoId,
      startTime: parseTimeString(newSong.startTime),
    };

    onAddSong(song, playlist.id);
    setNewSong({ title: '', url: '', startTime: '0:00' });
    toast.success('Song added');
  };

  const handleDeleteSong = (songId: string) => {
    onDeleteSong(songId, playlist.id);
    toast.success('Song deleted');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Songs - {playlist.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            {/* Add New Song Form */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/30 p-4 rounded-lg border"
            >
              <h3 className="font-medium mb-3 text-sm">Add New Song</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Song title"
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Input
                    placeholder="YouTube URL"
                    value={newSong.url}
                    onChange={(e) => setNewSong({ ...newSong, url: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="0:00"
                    value={newSong.startTime}
                    onChange={(e) => setNewSong({ ...newSong, startTime: e.target.value })}
                    className="h-8 w-20"
                  />
                  <Button onClick={handleAddNewSong} size="sm" className="h-8">
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Songs Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Title</TableHead>
                    <TableHead className="w-[35%]">YouTube URL</TableHead>
                    <TableHead className="w-[15%]">Start Time</TableHead>
                    <TableHead className="w-[10%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {songs.map((song) => (
                    <TableRow key={song.id}>
                      <TableCell>
                        {song.isEditing ? (
                          <Input
                            value={song.tempTitle || ''}
                            onChange={(e) => updateTempField(song.id, 'tempTitle', e.target.value)}
                            className="h-8"
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-primary transition-colors"
                            onClick={() => startEditing(song.id)}
                          >
                            {song.title}
                          </span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {song.isEditing ? (
                          <Input
                            value={song.tempUrl || ''}
                            onChange={(e) => updateTempField(song.id, 'tempUrl', e.target.value)}
                            className="h-8"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className="cursor-pointer hover:text-primary transition-colors text-sm truncate"
                              onClick={() => startEditing(song.id)}
                            >
                              youtube.com/watch?v={song.url}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://youtube.com/watch?v=${song.url}`, '_blank')}
                              className="h-6 w-6 p-0"
                            >
                              <ExternalLink size={12} />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {song.isEditing ? (
                          <Input
                            value={song.tempStartTime || ''}
                            onChange={(e) => updateTempField(song.id, 'tempStartTime', e.target.value)}
                            className="h-8 w-20"
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-primary transition-colors"
                            onClick={() => startEditing(song.id)}
                          >
                            {formatTime(song.startTime)}
                          </span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {song.isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => saveEditing(song.id)}
                                className="h-6 w-6 p-0 text-green-500 hover:text-green-600"
                              >
                                <Save size={12} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelEditing(song.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                              >
                                <X size={12} />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSong(song.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                            >
                              <Trash size={12} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {songs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No songs in this group yet. Add your first song above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}