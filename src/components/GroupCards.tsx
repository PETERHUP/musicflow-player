import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shuffle, DotsSixVertical, Play, Settings, Edit } from '@phosphor-icons/react';
import { Playlist, Song, LayoutSettings } from '@/lib/types';
import { motion, Reorder } from 'framer-motion';

interface GroupCardsProps {
  playlists: Playlist[];
  currentPlaylistId: string | null;
  currentSong: Song | null;
  layoutSettings: LayoutSettings;
  onPlayGroup: (playlistId: string, shuffled?: boolean) => void;
  onReorderGroups: (newOrder: Playlist[]) => void;
  onLayoutChange: (settings: LayoutSettings) => void;
  onEditGroup: (playlistId: string) => void;
}

export function GroupCards({
  playlists,
  currentPlaylistId,
  currentSong,
  layoutSettings,
  onPlayGroup,
  onReorderGroups,
  onLayoutChange,
  onEditGroup,
}: GroupCardsProps) {
  const [orderedPlaylists, setOrderedPlaylists] = useState(playlists);
  const [showSettings, setShowSettings] = useState(false);

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

  const getCardSize = () => {
    switch (layoutSettings.cardSize) {
      case 'small': return 'h-24';
      case 'medium': return 'h-32';
      case 'large': return 'h-40';
      default: return 'h-32';
    }
  };

  const getGridCols = () => {
    switch (layoutSettings.cardsPerRow) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 5: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
      case 6: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header with Settings */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Music Groups</h2>
          <Badge variant="outline" className="text-xs">
            {orderedPlaylists.length} groups
          </Badge>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="h-8 w-8 p-0"
        >
          <Settings size={14} />
        </Button>
      </div>

      {/* Layout Settings */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border rounded-lg p-4 space-y-3"
        >
          <h3 className="font-medium text-sm">Layout Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Cards per Row</label>
              <Select
                value={layoutSettings.cardsPerRow.toString()}
                onValueChange={(value) => onLayoutChange({
                  ...layoutSettings,
                  cardsPerRow: parseInt(value)
                })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Card Size</label>
              <Select
                value={layoutSettings.cardSize}
                onValueChange={(value: 'small' | 'medium' | 'large') => onLayoutChange({
                  ...layoutSettings,
                  cardSize: value
                })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Display Options</label>
              <div className="flex gap-2 text-xs">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={layoutSettings.showSongCount}
                    onChange={(e) => onLayoutChange({
                      ...layoutSettings,
                      showSongCount: e.target.checked
                    })}
                    className="w-3 h-3"
                  />
                  Song Count
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={layoutSettings.showCurrentSong}
                    onChange={(e) => onLayoutChange({
                      ...layoutSettings,
                      showCurrentSong: e.target.checked
                    })}
                    className="w-3 h-3"
                  />
                  Current Song
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Group Cards Grid */}
      <Reorder.Group
        axis="y"
        values={orderedPlaylists}
        onReorder={handleReorder}
        className={`grid ${getGridCols()} gap-4`}
      >
        {orderedPlaylists.map((playlist) => (
          <Reorder.Item
            key={playlist.id}
            value={playlist}
            className="touch-none"
            whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" }}
          >
            <Card
              className={`${getCardSize()} transition-all duration-200 hover:scale-[1.02] cursor-grab active:cursor-grabbing relative group ${
                currentPlaylistId === playlist.id
                  ? 'ring-2 ring-primary/50 bg-primary/10'
                  : 'hover:bg-card/80'
              }`}
            >
              {/* Drag Handle */}
              <div className="absolute top-2 left-2 text-muted-foreground/50 hover:text-foreground transition-colors z-10">
                <DotsSixVertical size={14} />
              </div>

              {/* Edit Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditGroup(playlist.id)}
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Edit size={12} />
              </Button>

              <div className="p-4 h-full flex flex-col justify-between">
                {/* Group Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg truncate pr-2">
                      {playlist.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {layoutSettings.showSongCount && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getGroupColor(playlist.name)}`}
                      >
                        {playlist.songs.length} songs
                      </Badge>
                    )}
                  </div>
                  
                  {layoutSettings.showCurrentSong && currentPlaylistId === playlist.id && currentSong && (
                    <p className="text-xs text-muted-foreground truncate">
                      ♪ {currentSong.title}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayGroup(playlist.id, true);
                    }}
                    disabled={playlist.songs.length === 0}
                    className="flex-1 h-8 text-xs"
                    title="Shuffle and play"
                  >
                    <Shuffle size={14} className="mr-1" />
                    Shuffle
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={currentPlaylistId === playlist.id ? "default" : "secondary"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayGroup(playlist.id);
                    }}
                    disabled={playlist.songs.length === 0}
                    className="flex-1 h-8 text-xs"
                    title="Play next song in group"
                  >
                    <Play size={14} weight="fill" className="mr-1" />
                    Play
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
          className="text-center py-12 text-muted-foreground"
        >
          <div className="max-w-md mx-auto">
            <p className="text-sm mb-2">No music groups created yet</p>
            <p className="text-xs">Create groups like "Goal", "Penalty", "Warmup" etc. using the Music Manager</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}