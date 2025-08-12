import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { List } from '@phosphor-icons/react';
import { SportsMusicManager } from './SportsMusicManager';
import { Song, Playlist } from '@/lib/types';

interface HamburgerMenuProps {
  playlists: Playlist[];
  onAddSong: (song: Song, playlistId: string) => void;
  onAddSongs: (songs: Song[], playlistId: string) => void;
  onCreatePlaylist: (name: string) => void;
  onDeleteSong: (songId: string, playlistId: string) => void;
}

export function HamburgerMenu({
  playlists,
  onAddSong,
  onAddSongs,
  onCreatePlaylist,
  onDeleteSong,
}: HamburgerMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="fixed top-4 left-4 z-50 bg-card/80 backdrop-blur-sm hover:bg-card"
        >
          <List className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Music Manager</SheetTitle>
        </SheetHeader>
        <div className="mt-6 h-full overflow-y-auto">
          <SportsMusicManager
            playlists={playlists}
            onAddSong={onAddSong}
            onAddSongs={onAddSongs}
            onCreatePlaylist={onCreatePlaylist}
            onDeleteSong={onDeleteSong}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}