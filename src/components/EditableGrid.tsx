import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash, Plus, Save, X, ExternalLink, Warning, CheckCircle, Clock } from '@phosphor-icons/react';
import { Song, Playlist, validateYouTubeLink } from '@/lib/types';
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
  tempCustomName?: string;
  tempUrl?: string;
  tempStartTime?: string;
  validating?: boolean;
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
    customName: '',
    url: '',
    startTime: '0:00'
  });
  const [validatingAll, setValidatingAll] = useState(false);

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
              tempCustomName: song.customName || '',
              tempUrl: song.url, // Use the full URL as stored
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
          ? { ...song, isEditing: false, tempTitle: undefined, tempCustomName: undefined, tempUrl: undefined, tempStartTime: undefined }
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
            customName: song.tempCustomName || '',
            url: song.tempUrl!, // Store the full URL
            startTime: parseTimeString(song.tempStartTime || '0:00'),
            isEditing: false,
            tempTitle: undefined,
            tempCustomName: undefined,
            tempUrl: undefined,
            tempStartTime: undefined
          }
        : s
    );

    setSongs(updatedSongs);
    onUpdateSongs(playlist.id, updatedSongs);
    toast.success('Song updated');
  };

  const updateTempField = (songId: string, field: 'tempTitle' | 'tempCustomName' | 'tempUrl' | 'tempStartTime', value: string) => {
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
      customName: newSong.customName || '',
      url: newSong.url, // Store the full URL
      startTime: parseTimeString(newSong.startTime),
    };

    onAddSong(song, playlist.id);
    setNewSong({ title: '', customName: '', url: '', startTime: '0:00' });
    toast.success('Song added');
  };

  const handleDeleteSong = (songId: string) => {
    onDeleteSong(songId, playlist.id);
    toast.success('Song deleted');
  };

  const validateSingleSong = async (songId: string) => {
    setSongs(current => 
      current.map(song => 
        song.id === songId ? { ...song, validating: true } : song
      )
    );

    const song = songs.find(s => s.id === songId);
    if (!song) return;

    const isValid = await validateYouTubeLink(song.url);
    
    setSongs(current => 
      current.map(s => 
        s.id === songId ? { 
          ...s, 
          isValid, 
          lastChecked: Date.now(),
          validating: false 
        } : s
      )
    );

    const updatedSongs = songs.map(s => 
      s.id === songId ? { 
        ...s, 
        isValid, 
        lastChecked: Date.now(),
        validating: false 
      } : s
    );

    onUpdateSongs(playlist.id, updatedSongs);
    
    if (isValid) {
      toast.success('Link is valid');
    } else {
      toast.error('Link appears to be invalid');
    }
  };

  const validateAllSongs = async () => {
    setValidatingAll(true);
    const updatedSongs = [];

    for (const song of songs) {
      const isValid = await validateYouTubeLink(`https://youtube.com/watch?v=${song.url}`);
      updatedSongs.push({
        ...song,
        isValid,
        lastChecked: Date.now()
      });
    }

    setSongs(updatedSongs);
    onUpdateSongs(playlist.id, updatedSongs);
    setValidatingAll(false);

    const invalidCount = updatedSongs.filter(s => !s.isValid).length;
    if (invalidCount === 0) {
      toast.success('All songs validated successfully');
    } else {
      toast.warning(`${invalidCount} song(s) may have invalid links`);
    }
  };

  const removeInvalidSongs = () => {
    const validSongs = songs.filter(song => song.isValid !== false);
    const removedCount = songs.length - validSongs.length;
    
    if (removedCount === 0) {
      toast.info('No invalid songs to remove');
      return;
    }

    setSongs(validSongs);
    onUpdateSongs(playlist.id, validSongs);
    toast.success(`Removed ${removedCount} invalid song(s)`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Songs - {playlist.name}</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={validateAllSongs}
                disabled={validatingAll}
                className="h-8"
              >
                {validatingAll ? (
                  <>
                    <Clock size={14} className="mr-1 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} className="mr-1" />
                    Check All Links
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={removeInvalidSongs}
                className="h-8"
              >
                <Trash size={14} className="mr-1" />
                Remove Invalid
              </Button>
            </div>
          </div>
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <Input
                    placeholder="Song title"
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Custom name (optional)"
                    value={newSong.customName}
                    onChange={(e) => setNewSong({ ...newSong, customName: e.target.value })}
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
                    <TableHead className="w-[25%]">Title</TableHead>
                    <TableHead className="w-[20%]">Custom Name</TableHead>
                    <TableHead className="w-[30%]">YouTube URL</TableHead>
                    <TableHead className="w-[10%]">Start Time</TableHead>
                    <TableHead className="w-[15%]">Actions</TableHead>
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
                            value={song.tempCustomName || ''}
                            onChange={(e) => updateTempField(song.id, 'tempCustomName', e.target.value)}
                            className="h-8"
                            placeholder="Optional custom name"
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-primary transition-colors text-sm"
                            onClick={() => startEditing(song.id)}
                          >
                            {song.customName || '-'}
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
                              {song.url.length > 30 ? `${song.url.substring(0, 30)}...` : song.url}
                            </span>
                            <div className="flex items-center gap-1">
                              {song.isValid === true && (
                                <Badge variant="outline" className="h-5 px-1 text-xs text-green-600 border-green-600">
                                  <CheckCircle size={10} />
                                </Badge>
                              )}
                              {song.isValid === false && (
                                <Badge variant="outline" className="h-5 px-1 text-xs text-red-600 border-red-600">
                                  <Warning size={10} />
                                </Badge>
                              )}
                              {song.validating && (
                                <Clock size={12} className="animate-spin text-muted-foreground" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(song.url, '_blank')}
                                className="h-6 w-6 p-0"
                              >
                                <ExternalLink size={12} />
                              </Button>
                            </div>
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
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => validateSingleSong(song.id)}
                                disabled={song.validating}
                                className="h-6 w-6 p-0 text-blue-500 hover:text-blue-600"
                                title="Check this link"
                              >
                                {song.validating ? (
                                  <Clock size={12} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={12} />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSong(song.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                              >
                                <Trash size={12} />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {songs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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