import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shuffle, DotsSixVertical, Play } from '@phosphor-icons/react';
import { Playlist, Song } from '@/lib/types';
import { motion, Reorder } from 'framer-motion';

interface GroupButtonsProps {
  playlists: Playlist[];
  currentPlaylistId: string | null;
  currentSong: Song | null;
  onPlayGroup: (playlistId: string, shuffled?: boolean) => void;
  onReorderGroups: (newOrder: Playlist[]) => void;
}

export function GroupButtons({
  playlists,
  currentPlaylistId,
  currentSong,
  onPlayGroup,
  onReorderGroups,
}: GroupButtonsProps) {
  const [orderedPlaylists, setOrderedPlaylists] = useState(playlists);

  React.useEffect(() => {
    setOrderedPlaylists(playlists);
  }, [playlists]);

  const handleReorder = (newOrder: Playlist[]) => {
    setOrderedPlaylists(newOrder);
    onReorderGroups(newOrder);
  };

  const getGroupColor = (playlistName: string) => {
    const colors = {
      'goal': 'bg-green-500/20 border-green-500/30 text-green-400',
      'penalty': 'bg-red-500/20 border-red-500/30 text-red-400',
      'warmup': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      'intermission': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      'pregame': 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      'postgame': 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      'timeout': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      'celebration': 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    };
    
    const name = playlistName.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (name.includes(key)) return color;
    }
    return 'bg-primary/20 border-primary/30 text-primary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Music Groups</h2>
        <Badge variant="outline" className="text-xs">
          {orderedPlaylists.length} groups
        </Badge>
      </div>

      <Reorder.Group
        axis="y"
        values={orderedPlaylists}
        onReorder={handleReorder}
        className="space-y-3"
      >
        {orderedPlaylists.map((playlist) => (
          <Reorder.Item
            key={playlist.id}
            value={playlist}
            className="touch-none"
            whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)" }}
          >
            <Card
              className={`p-4 transition-all duration-200 hover:scale-[1.02] cursor-grab active:cursor-grabbing ${
                currentPlaylistId === playlist.id
                  ? 'ring-2 ring-primary/50 bg-primary/10'
                  : 'hover:bg-card/80'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <div className="text-muted-foreground hover:text-foreground transition-colors">
                  <DotsSixVertical size={16} />
                </div>

                {/* Group Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">
                      {playlist.name}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getGroupColor(playlist.name)}`}
                    >
                      {playlist.songs.length} songs
                    </Badge>
                  </div>
                  
                  {currentPlaylistId === playlist.id && currentSong && (
                    <p className="text-xs text-muted-foreground truncate">
                      Playing: {currentSong.title}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPlayGroup(playlist.id, true)}
                    disabled={playlist.songs.length === 0}
                    className="h-8 w-8 p-0 hover:bg-accent/20"
                    title="Shuffle and play"
                  >
                    <Shuffle size={14} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={currentPlaylistId === playlist.id ? "default" : "secondary"}
                    onClick={() => onPlayGroup(playlist.id)}
                    disabled={playlist.songs.length === 0}
                    className="h-8 w-8 p-0"
                    title="Play next song in group"
                  >
                    <Play size={14} weight="fill" />
                  </Button>
                </div>
              </div>
            </Card>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {orderedPlaylists.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <p className="text-sm">No music groups created yet</p>
          <p className="text-xs mt-1">Create groups like "Goal", "Penalty", "Warmup" etc.</p>
        </motion.div>
      )}
    </motion.div>
  );
}