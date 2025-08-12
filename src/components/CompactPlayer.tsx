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
      {/* Top Control Bar - 30px height */}
      <div className="flex items-center justify-center gap-2 mb-3 h-[30px]">
        <Button
          size="sm"
          variant={isPlaying ? "secondary" : "default"}
          onClick={isPlaying ? onPause : onPlay}
          disabled={!currentSong}
          className="h-[30px] px-4 text-xs font-medium"
        >
          {isPlaying ? (
            <>
              <Pause size={14} weight="fill" className="mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play size={14} weight="fill" className="mr-1" />
              Play
            </>
          )}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onStop}
          disabled={!currentSong}
          className="h-[30px] px-4 text-xs font-medium"
        >
          <Square size={14} weight="fill" className="mr-1" />
          Stop
        </Button>
      </div>

      {/* Compact Player Card */}
      <Card className="p-3 bg-card/50 backdrop-blur-sm border-primary/20">
        <div className="flex items-center gap-3">
          {/* Compact YouTube Player */}
          <div className="w-24 h-14 bg-secondary rounded overflow-hidden flex-shrink-0">
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
              {currentSong?.customName || currentSong?.title || 'No song selected'}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong ? 'Ready to play' : 'Select a music group to begin'}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}