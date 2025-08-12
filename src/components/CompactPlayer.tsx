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
      {/* Top Control Bar - 90px height */}
      <div className="flex items-center justify-center gap-4 mb-3 h-[90px]">
        <Button
          size="lg"
          variant="outline"
          onClick={isPlaying ? onPause : onPlay}
          disabled={!currentSong}
          className={`h-[90px] px-8 text-base font-medium border-2 transition-all duration-200 ${
            isPlaying 
              ? 'bg-pink-100 hover:bg-pink-200 border-pink-300 text-pink-800' 
              : 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause size={32} weight="fill" className="mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play size={32} weight="fill" className="mr-2" />
              Play
            </>
          )}
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={onStop}
          disabled={!currentSong}
          className="h-[90px] px-8 text-base font-medium bg-red-100 hover:bg-red-200 border-2 border-red-300 text-red-800 transition-all duration-200"
        >
          <Square size={32} weight="fill" className="mr-2" />
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