import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Trash, Music } from '@phosphor-icons/react';
import { Playlist, Song, formatTime } from '@/lib/types';
import { motion } from 'framer-motion';

interface PlaylistManagerProps {
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  currentSong: Song | null;
  onSelectPlaylist: (playlistId: string) => void;
  onPlayPlaylist: (playlistId: string) => void;
  onPlaySong: (song: Song, playlistId: string) => void;
  onDeleteSong: (songId: string, playlistId: string) => void;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  playlists,
  selectedPlaylistId,
  currentSong,
  onSelectPlaylist,
  onPlayPlaylist,
  onPlaySong,
  onDeleteSong,
}) => {
  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music />
          Playlists
        </CardTitle>
      </CardHeader>
      <CardContent>
        {playlists.length === 0 ? (
          <div className="text-center py-8">
            <Music size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No playlists yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first playlist using the "Add New Song" panel
            </p>
          </div>
        ) : (
          <Tabs value={selectedPlaylistId || ''} onValueChange={onSelectPlaylist}>
            <TabsList className="grid w-full grid-cols-1 gap-1 h-auto p-1">
              {playlists.map((playlist) => (
                <TabsTrigger
                  key={playlist.id}
                  value={playlist.id}
                  className="justify-start data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{playlist.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {playlist.songs.length}
                    </Badge>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {playlists.map((playlist) => (
              <TabsContent key={playlist.id} value={playlist.id} className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{playlist.name}</h3>
                    <Button
                      onClick={() => onPlayPlaylist(playlist.id)}
                      disabled={playlist.songs.length === 0}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <Play className="mr-2" size={16} />
                      Play All
                    </Button>
                  </div>

                  {playlist.songs.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <p className="text-muted-foreground">No songs in this playlist</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add songs using the panel on the right
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {playlist.songs.map((song, index) => (
                        <motion.div
                          key={song.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`
                            p-3 rounded-lg border transition-all duration-200 hover:bg-accent/10
                            ${currentSong?.id === song.id 
                              ? 'bg-accent/20 border-accent' 
                              : 'bg-card hover:border-accent/50'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => onPlaySong(song, playlist.id)}
                            >
                              <h4 className="font-medium hover:text-accent transition-colors">
                                {song.title}
                                {currentSong?.id === song.id && (
                                  <Badge variant="default" className="ml-2 bg-accent">
                                    Playing
                                  </Badge>
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Starts at {formatTime(song.startTime)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onPlaySong(song, playlist.id)}
                                className="hover:bg-accent/20 hover:text-accent"
                              >
                                <Play size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteSong(song.id, playlist.id)}
                                className="hover:bg-destructive/20 hover:text-destructive"
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};