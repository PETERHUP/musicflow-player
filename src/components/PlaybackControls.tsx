import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, Shuffle, List } from '@phosphor-icons/react';
import { Song, formatTime } from '@/lib/types';
import { motion, Reorder } from 'framer-motion';

interface PlaybackControlsProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isShuffled: boolean;
  queue: Song[];
  currentTime: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onReorderQueue: (newQueue: Song[]) => void;
  onSelectSong: (song: Song) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentSong,
  isPlaying,
  isShuffled,
  queue,
  currentTime,
  onPlay,
  onPause,
  onNext,
  onToggleShuffle,
  onReorderQueue,
  onSelectSong,
}) => {
  return (
    <div className="space-y-4">
      {/* Current Song Info */}
      {currentSong && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{currentSong.title}</h3>
                <p className="text-muted-foreground">
                  {formatTime(currentTime)} / Playing from {formatTime(currentSong.startTime)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isShuffled ? "default" : "outline"}
                  size="icon"
                  onClick={onToggleShuffle}
                  className={isShuffled ? "bg-accent text-accent-foreground" : ""}
                >
                  <Shuffle />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={isPlaying ? onPause : onPlay}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onNext}
                  disabled={queue.length <= 1}
                >
                  <SkipForward />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List />
            Queue ({queue.length} songs)
            {isShuffled && <Badge variant="secondary">Shuffled</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No songs in queue. Add songs to get started!
            </p>
          ) : (
            <Reorder.Group values={queue} onReorder={onReorderQueue} className="space-y-2">
              {queue.map((song, index) => (
                <Reorder.Item
                  key={song.id}
                  value={song}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`
                      p-3 rounded-lg border transition-all duration-200 hover:bg-accent/10
                      ${currentSong?.id === song.id 
                        ? 'bg-accent/20 border-accent' 
                        : 'bg-card hover:border-accent/50'
                      }
                    `}
                  >
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => onSelectSong(song)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{song.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Starts at {formatTime(song.startTime)}
                          {currentSong?.id === song.id && (
                            <Badge variant="secondary" className="ml-2">
                              Now Playing
                            </Badge>
                          )}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        #{index + 1}
                      </div>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </CardContent>
      </Card>
    </div>
  );
};