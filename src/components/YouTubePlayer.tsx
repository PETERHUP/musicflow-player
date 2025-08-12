import React, { useEffect, useRef, useState } from 'react';
import { Song } from '@/lib/types';

interface YouTubePlayerProps {
  song: Song | null;
  isPlaying: boolean;
  onEnded: () => void;
  onReady: () => void;
  onTimeUpdate: (currentTime: number) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  song,
  isPlaying,
  onEnded,
  onReady,
  onTimeUpdate
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [apiReady, setApiReady] = useState(false);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    } else {
      setApiReady(true);
    }
  }, []);

  useEffect(() => {
    if (apiReady && containerRef.current && !playerRef.current) {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '360',
        width: '640',
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            onReady();
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnded();
            }
          },
        },
      });
    }
  }, [apiReady, onReady, onEnded]);

  useEffect(() => {
    if (playerRef.current && song) {
      playerRef.current.loadVideoById({
        videoId: song.url,
        startSeconds: song.startTime,
      });
    }
  }, [song]);

  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
        
        timeUpdateIntervalRef.current = setInterval(() => {
          if (playerRef.current && playerRef.current.getCurrentTime) {
            const currentTime = playerRef.current.getCurrentTime();
            onTimeUpdate(currentTime);
          }
        }, 1000);
      } else {
        playerRef.current.pauseVideo();
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = null;
        }
      }
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [isPlaying, onTimeUpdate]);

  if (!song) {
    return (
      <div className="flex items-center justify-center h-[360px] bg-card rounded-lg border">
        <p className="text-muted-foreground">Select a song to play</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full" />
    </div>
  );
};