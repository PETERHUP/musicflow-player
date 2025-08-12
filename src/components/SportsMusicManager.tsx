import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash, MusicNote } from '@phosphor-icons/react';
import { Song, Playlist } from '@/lib/types';
import { extractYouTubeId, parseTimeString } from '@/lib/types';
import { YouTubeImport } from '@/components/YouTubeImport';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SportsMusicManagerProps {
  playlists: Playlist[];
  onAddSong: (song: Song, playlistId: string) => void;
  onAddSongs: (songs: Song[], playlistId: string) => void;
  onCreatePlaylist: (name: string) => void;
  onDeleteSong: (songId: string, playlistId: string) => void;
}

const SPORTS_GROUPS = [
  'Goal',
  'Penalty',
  'Warmup',
  'Intermission',
  'Pregame',
  'Postgame',
  'Timeout',
  'Celebration',
  'Custom'
];

export function SportsMusicManager({
  playlists,
  onAddSong,
  onAddSongs,
  onCreatePlaylist,
  onDeleteSong,
}: SportsMusicManagerProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Goal');
  const [songUrl, setSongUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [startTime, setStartTime] = useState('0:00');

  const handleCreateGroup = () => {
    const name = selectedGroup === 'Custom' ? newGroupName : selectedGroup;
    if (!name.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    
    if (playlists.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      toast.error('A group with this name already exists');
      return;
    }

    onCreatePlaylist(name);
    setNewGroupName('');
    setSelectedGroup('Goal');
    toast.success(`Created group: ${name}`);
  };

  const handleAddSong = () => {
    if (!songUrl.trim() || !songTitle.trim()) {
      toast.error('Please enter both song URL and title');
      return;
    }

    const videoId = extractYouTubeId(songUrl);
    if (!videoId) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    const targetGroup = playlists.find(p => p.name === selectedGroup);
    if (!targetGroup) {
      toast.error('Please select a valid group');
      return;
    }

    const song: Song = {
      id: Date.now().toString(),
      title: songTitle,
      url: videoId,
      startTime: parseTimeString(startTime),
    };

    onAddSong(song, targetGroup.id);
    setSongUrl('');
    setSongTitle('');
    setStartTime('0:00');
    toast.success(`Added "${songTitle}" to ${targetGroup.name}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <MusicNote size={20} className="text-primary" />
        <h2 className="text-lg font-semibold">Music Manager</h2>
      </div>

      <Tabs defaultValue="add-group" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add-group">Add Group</TabsTrigger>
          <TabsTrigger value="add-song">Add Song</TabsTrigger>
          <TabsTrigger value="import">Import Playlist</TabsTrigger>
        </TabsList>

        <TabsContent value="add-group" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3">Create Music Group</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="group-type">Group Type</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS_GROUPS.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedGroup === 'Custom' && (
                <div>
                  <Label htmlFor="custom-name">Custom Group Name</Label>
                  <Input
                    id="custom-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter custom group name"
                  />
                </div>
              )}

              <Button onClick={handleCreateGroup} className="w-full">
                <Plus size={16} className="mr-2" />
                Create Group
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="add-song" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3">Add Song to Group</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="target-group">Target Group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {playlists.map(playlist => (
                      <SelectItem key={playlist.id} value={playlist.name}>
                        {playlist.name} ({playlist.songs.length} songs)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="song-title">Song Title</Label>
                <Input
                  id="song-title"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Enter song title"
                />
              </div>

              <div>
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input
                  id="youtube-url"
                  value={songUrl}
                  onChange={(e) => setSongUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <Label htmlFor="start-time">Start Time (mm:ss)</Label>
                <Input
                  id="start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="0:00"
                />
              </div>

              <Button 
                onClick={handleAddSong} 
                className="w-full"
                disabled={playlists.length === 0}
              >
                <Plus size={16} className="mr-2" />
                Add Song
              </Button>
            </div>
          </Card>
        <TabsContent value="import" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3">Import YouTube Playlist</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Import songs from a YouTube playlist. You can select which songs to import and set a default start time.
            </p>
            <YouTubeImport
              playlists={playlists}
              onAddSongs={onAddSongs}
              onCreatePlaylist={onCreatePlaylist}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Current Groups Overview */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Current Groups</h3>
        <div className="space-y-2">
          {playlists.map(playlist => (
            <div key={playlist.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
              <div>
                <span className="font-medium text-sm">{playlist.name}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {playlist.songs.length} songs
                </Badge>
              </div>
            </div>
          ))}
          
          {playlists.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No groups created yet. Create your first group above.
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}