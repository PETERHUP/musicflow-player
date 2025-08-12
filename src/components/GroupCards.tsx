import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shuffle, DotsSixVertical, Settings, Edit } from '@phosphor-icons/react';
import { Playlist, Song, LayoutSettings } from '@/lib/types';
import { motion } from 'framer-motion';

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

  const getUnplayedCount = (playlist: Playlist) => {
    const unplayed = playlist.songs.filter(song => !playlist.playedSongs?.includes(song.id));
    return unplayed.length;
  };

  const getGroupColor = (playlistName: string) => {
    const colors = {
      'goal': 'bg-green-500/20 border-green-500/30 text-green-400',
      'penalty': 'bg-red-500/20 border-red-500/30 text-red-400',
      'power play': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      'intermission': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      'warm up': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      'pre-game': 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      'post-game': 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    };
    
    const name = playlistName.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (name.includes(key)) return color;
    }
    return 'bg-primary/20 border-primary/30 text-primary';
  };

  const getCardSize = () => {
    switch (layoutSettings.cardSize) {
      case 'small': return 'aspect-square min-h-[100px] max-w-[120px]';
      case 'medium': return 'aspect-square min-h-[140px] max-w-[120px]';
      case 'large': return 'aspect-square min-h-[180px] max-w-[120px]';
      default: return 'aspect-square min-h-[100px] max-w-[120px]';
    }
  };

  const getGridCols = () => {
    switch (layoutSettings.cardsPerRow) {
      case 1: return 'grid-cols-1 justify-items-center';
      case 2: return 'grid-cols-2 justify-items-center gap-4';
      case 3: return 'grid-cols-3 justify-items-center gap-4';
      case 4: return 'grid-cols-2 sm:grid-cols-4 justify-items-center gap-3';
      case 5: return 'grid-cols-3 sm:grid-cols-5 justify-items-center gap-2';
      case 6: return 'grid-cols-3 sm:grid-cols-6 justify-items-center gap-2';
      default: return 'grid-cols-3 justify-items-center gap-4';
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
      <div className={`grid ${getGridCols()} gap-4`}>
        {orderedPlaylists.map((playlist, index) => {
          const unplayedCount = getUnplayedCount(playlist);
          const totalCount = playlist.songs.length;
          
          return (
            <motion.div
              key={playlist.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.02 }}
              transition={{ 
                layout: { duration: 0.2, ease: "easeInOut" },
                type: "spring",
                stiffness: 600,
                damping: 30
              }}
              className="touch-none"
            >
              <Card
                className={`${getCardSize()} transition-all duration-200 hover:scale-[1.02] cursor-pointer relative group ${
                  currentPlaylistId === playlist.id
                    ? 'ring-2 ring-primary/50 bg-primary/10'
                    : 'hover:bg-card/80'
                } ${getGroupColor(playlist.name)}`}
                onClick={() => onPlayGroup(playlist.id)}
              >
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 text-muted-foreground/50 hover:text-foreground transition-colors z-10 cursor-grab">
                  <DotsSixVertical size={16} />
                </div>

                {/* Edit Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditGroup(playlist.id);
                  }}
                  className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Edit size={14} />
                </Button>

                {/* Shuffle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayGroup(playlist.id, true);
                  }}
                  disabled={playlist.songs.length === 0}
                  className="absolute top-2 right-10 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Shuffle and play"
                >
                  <Shuffle size={14} />
                </Button>

                <div className="p-3 h-full flex flex-col justify-center items-center text-center">
                  {/* Group Image/Icon */}
                  <div className="text-3xl md:text-4xl mb-2">
                    {playlist.image || '🎵'}
                  </div>
                  
                  {/* Group Name */}
                  <h3 className="font-bold text-sm md:text-base mb-1 truncate w-full">
                    {playlist.name}
                  </h3>
                  
                  {/* Progress Display */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold">
                      {unplayedCount} / {totalCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      unplayed songs
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-1 mt-1">
                      <div 
                        className="bg-current h-1 rounded-full transition-all duration-300"
                        style={{ 
                          width: totalCount > 0 ? `${((totalCount - unplayedCount) / totalCount) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                  </div>

                  {/* Current Song Display */}
                  {layoutSettings.showCurrentSong && currentPlaylistId === playlist.id && currentSong && (
                    <div className="mt-1 text-xs text-muted-foreground truncate w-full">
                      ♪ {(currentSong.customName || currentSong.title).length > 15 ? `${(currentSong.customName || currentSong.title).substring(0, 15)}...` : (currentSong.customName || currentSong.title)}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {orderedPlaylists.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <div className="max-w-md mx-auto">
            <p className="text-sm mb-2">No music groups created yet</p>
            <p className="text-xs">Use the hamburger menu to access Music Manager and create groups</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}