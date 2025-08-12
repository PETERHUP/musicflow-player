import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square } from '@phosphor-icons/react';
import { Song } from '@/lib/types';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { motion } from 'framer-motion';

interface CompactPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onEnded: () => void;
  onTimeUpdate: (time: number) => void;
}

export function CompactPlayer({
  currentSong,
  isPlaying,
  onPlay,
  onPause,
  onStop,
  onEnded,
  onTimeUpdate,
}: CompactPlayerProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full"
    >
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
        <div className="flex items-center gap-4">
          {/* Compact YouTube Player */}
          <div className="w-32 h-18 bg-secondary rounded-md overflow-hidden flex-shrink-0">
            <YouTubePlayer
              song={currentSong}
              isPlaying={isPlaying}
              onEnded={onEnded}
              onReady={() => {}}
              onTimeUpdate={onTimeUpdate}
              compact={true}
            />
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">
              {currentSong?.title || 'No song selected'}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong ? 'Ready to play' : 'Select a music group to begin'}
            </p>
          </div>

          {/* Compact Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant={isPlaying ? "secondary" : "default"}
              onClick={isPlaying ? onPause : onPlay}
              disabled={!currentSong}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? (
                <Pause size={14} weight="fill" />
              ) : (
                <Play size={14} weight="fill" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onStop}
              disabled={!currentSong}
              className="h-8 w-8 p-0"
            >
              <Square size={14} weight="fill" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}