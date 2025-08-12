import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from '@phosphor-icons/react';
import { Song, Playlist, extractYouTubeId, parseTimeString } from '@/lib/types';
import { toast } from 'sonner';

interface AddSongPanelProps {
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onAddSong: (song: Song, playlistId: string) => void;
  onCreatePlaylist: (name: string) => void;
  onSelectPlaylist: (playlistId: string) => void;
}

export const AddSongPanel: React.FC<AddSongPanelProps> = ({
  playlists,
  selectedPlaylistId,
  onAddSong,
  onCreatePlaylist,
  onSelectPlaylist,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('0:00');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);

  const handleAddSong = () => {
    if (!url.trim() || !title.trim()) {
      toast.error('Please fill in both URL and title');
      return;
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    if (!selectedPlaylistId) {
      toast.error('Please select a playlist');
      return;
    }

    const song: Song = {
      id: Date.now().toString(),
      title: title.trim(),
      url: videoId,
      startTime: parseTimeString(startTime),
    };

    onAddSong(song, selectedPlaylistId);
    
    setUrl('');
    setTitle('');
    setStartTime('0:00');
    
    toast.success('Song added successfully!');
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowNewPlaylist(false);
    toast.success('Playlist created!');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add New Song</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Playlist Selection */}
        <div className="space-y-2">
          <Label htmlFor="playlist-select">Playlist</Label>
          <div className="flex gap-2">
            <Select value={selectedPlaylistId || ''} onValueChange={onSelectPlaylist}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a playlist" />
              </SelectTrigger>
              <SelectContent>
                {playlists.map((playlist) => (
                  <SelectItem key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowNewPlaylist(!showNewPlaylist)}
            >
              <Plus />
            </Button>
          </div>
        </div>

        {/* New Playlist Creation */}
        {showNewPlaylist && (
          <div className="space-y-2">
            <Label htmlFor="new-playlist">New Playlist Name</Label>
            <div className="flex gap-2">
              <Input
                id="new-playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <Button onClick={handleCreatePlaylist}>Create</Button>
            </div>
          </div>
        )}

        {/* Song Details */}
        <div className="space-y-2">
          <Label htmlFor="song-url">YouTube URL</Label>
          <Input
            id="song-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="song-title">Song Title</Label>
          <Input
            id="song-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter song title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time (MM:SS)</Label>
          <Input
            id="start-time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="0:00"
            pattern="[0-9]+:[0-5][0-9]"
          />
        </div>

        <Button 
          onClick={handleAddSong} 
          className="w-full"
          disabled={!selectedPlaylistId}
        >
          <Plus className="mr-2" />
          Add Song
        </Button>
      </CardContent>
    </Card>
  );
};