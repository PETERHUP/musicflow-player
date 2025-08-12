import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash, MusicNote, CheckCircle, Warning, Clock } from '@phosphor-icons/react';
import { Song, Playlist, validateAllSongs } from '@/lib/types';
import { extractYouTubeId, parseTimeString } from '@/lib/types';
import { YouTubeImport } from '@/components/YouTubeImport';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SportsMusicManagerProps {
  playlists: Playlist[];
  onAddSong: (song: Song, playlistId: string) => void;
  onAddSongs: (songs: Song[], playlistId: string) => void;
  onCreatePlaylist: (name: string, image?: string) => void;
  onDeleteSong: (songId: string, playlistId: string) => void;
  onUpdatePlaylist?: (playlist: Playlist) => void;
}

const SPORTS_GROUPS = [
  { name: 'Goal', emoji: '🥅' },
  { name: 'Penalty', emoji: '⚠️' },
  { name: 'Power Play', emoji: '⚡' },
  { name: 'Intermission', emoji: '☕' },
  { name: 'Warm Up', emoji: '🔥' },
  { name: 'Pre-Game', emoji: '🏒' },
  { name: 'Post-Game', emoji: '🏆' },
  { name: 'Timeout', emoji: '⏸️' },
  { name: 'Celebration', emoji: '🎉' },
  { name: 'Custom', emoji: '🎵' }
];

export function SportsMusicManager({
  playlists,
  onAddSong,
  onAddSongs,
  onCreatePlaylist,
  onDeleteSong,
  onUpdatePlaylist,
}: SportsMusicManagerProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Goal');
  const [selectedEmoji, setSelectedEmoji] = useState('🥅');
  const [songUrl, setSongUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songCustomName, setSongCustomName] = useState('');
  const [startTime, setStartTime] = useState('0:00');
  const [validatingAll, setValidatingAll] = useState(false);

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

    onCreatePlaylist(name, selectedEmoji);
    setNewGroupName('');
    setSelectedGroup('Goal');
    setSelectedEmoji('🥅');
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
      customName: songCustomName || '',
      url: songUrl, // Store the full URL
      startTime: parseTimeString(startTime),
    };

    onAddSong(song, targetGroup.id);
    setSongUrl('');
    setSongTitle('');
    setSongCustomName('');
    setStartTime('0:00');
    toast.success(`Added "${songTitle}" to ${targetGroup.name}`);
  };

  const handleValidateAllPlaylists = async () => {
    setValidatingAll(true);
    let totalValidated = 0;
    let totalInvalid = 0;

    for (const playlist of playlists) {
      if (playlist.songs.length > 0) {
        const validatedSongs = await validateAllSongs(playlist.songs);
        const invalidCount = validatedSongs.filter(s => !s.isValid).length;
        totalInvalid += invalidCount;
        totalValidated += validatedSongs.length;

        if (onUpdatePlaylist) {
          onUpdatePlaylist({
            ...playlist,
            songs: validatedSongs
          });
        }
      }
    }

    setValidatingAll(false);
    
    if (totalInvalid === 0) {
      toast.success(`All ${totalValidated} songs validated successfully`);
    } else {
      toast.warning(`Validation complete: ${totalInvalid} of ${totalValidated} songs may have invalid links`);
    }
  };

  const removeAllInvalidSongs = () => {
    let totalRemoved = 0;
    
    playlists.forEach(playlist => {
      const validSongs = playlist.songs.filter(song => song.isValid !== false);
      const removedCount = playlist.songs.length - validSongs.length;
      totalRemoved += removedCount;
      
      if (removedCount > 0 && onUpdatePlaylist) {
        onUpdatePlaylist({
          ...playlist,
          songs: validSongs
        });
      }
    });

    if (totalRemoved === 0) {
      toast.info('No invalid songs to remove');
    } else {
      toast.success(`Removed ${totalRemoved} invalid song(s) from all playlists`);
    }
  };

  const getValidationStats = () => {
    const allSongs = playlists.flatMap(p => p.songs);
    const checked = allSongs.filter(s => s.lastChecked).length;
    const valid = allSongs.filter(s => s.isValid === true).length;
    const invalid = allSongs.filter(s => s.isValid === false).length;
    const unchecked = allSongs.length - checked;
    
    return { total: allSongs.length, checked, valid, invalid, unchecked };
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="add-group">Add Group</TabsTrigger>
          <TabsTrigger value="add-song">Add Song</TabsTrigger>
          <TabsTrigger value="import">Import Playlist</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="add-group" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3">Create Music Group</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="group-type">Group Type</Label>
                <Select value={selectedGroup} onValueChange={(value) => {
                  setSelectedGroup(value);
                  const group = SPORTS_GROUPS.find(g => g.name === value);
                  if (group) setSelectedEmoji(group.emoji);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS_GROUPS.map(group => (
                      <SelectItem key={group.name} value={group.name}>
                        {group.emoji} {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="group-emoji">Group Icon</Label>
                <Input
                  id="group-emoji"
                  value={selectedEmoji}
                  onChange={(e) => setSelectedEmoji(e.target.value)}
                  placeholder="🎵"
                  className="text-2xl text-center h-12"
                  maxLength={2}
                />
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
                <Label htmlFor="song-custom-name">Custom Display Name (Optional)</Label>
                <Input
                  id="song-custom-name"
                  value={songCustomName}
                  onChange={(e) => setSongCustomName(e.target.value)}
                  placeholder="Custom name for display"
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
        </TabsContent>

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

        <TabsContent value="settings" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3">Link Validation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check if YouTube links are valid and remove broken ones.
            </p>
            
            {(() => {
              const stats = getValidationStats();
              return (
                <div className="space-y-4">
                  {/* Validation Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-secondary/30 p-3 rounded text-center">
                      <div className="text-lg font-semibold">{stats.total}</div>
                      <div className="text-xs text-muted-foreground">Total Songs</div>
                    </div>
                    <div className="bg-green-500/10 p-3 rounded text-center">
                      <div className="text-lg font-semibold text-green-600">{stats.valid}</div>
                      <div className="text-xs text-muted-foreground">Valid</div>
                    </div>
                    <div className="bg-red-500/10 p-3 rounded text-center">
                      <div className="text-lg font-semibold text-red-600">{stats.invalid}</div>
                      <div className="text-xs text-muted-foreground">Invalid</div>
                    </div>
                    <div className="bg-yellow-500/10 p-3 rounded text-center">
                      <div className="text-lg font-semibold text-yellow-600">{stats.unchecked}</div>
                      <div className="text-xs text-muted-foreground">Unchecked</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleValidateAllPlaylists}
                      disabled={validatingAll || stats.total === 0}
                      className="flex-1"
                      variant="outline"
                    >
                      {validatingAll ? (
                        <>
                          <Clock size={16} className="mr-2 animate-spin" />
                          Checking All Links...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          Check All Links ({stats.total})
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={removeAllInvalidSongs}
                      disabled={stats.invalid === 0}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash size={16} className="mr-2" />
                      Remove Invalid ({stats.invalid})
                    </Button>
                  </div>

                  {stats.invalid > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                      <div className="flex items-center gap-2 text-yellow-600 text-sm">
                        <Warning size={16} />
                        <span className="font-medium">Warning:</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stats.invalid} song(s) may have invalid YouTube links. These songs may not play properly.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
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