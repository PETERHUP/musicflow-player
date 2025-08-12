import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, SpeakerHigh, SpeakerX, Microphone } from '@phosphor-icons/react';
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
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [wasPausedByMic, setWasPausedByMic] = useState(false);
  const micTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Clean up microphone stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (micTimeoutRef.current) {
        clearTimeout(micTimeoutRef.current);
      }
    };
  }, []);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
    // Don't auto-close the slider on change, let user close it manually or via timer
  };

  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
    // Auto-close after 3 seconds if opened
    if (!showVolumeSlider) {
      setTimeout(() => {
        setShowVolumeSlider(false);
      }, 3000);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Auto close slider after mute action
    setTimeout(() => {
      setShowVolumeSlider(false);
    }, 1000);
  };

  const handleMicToggle = async () => {
    if (!isMicActive) {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setIsMicActive(true);
        
        // Pause music if it's playing
        if (isPlaying) {
          setWasPausedByMic(true);
          onPause();
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
        // You could show a toast here if needed
      }
    } else {
      // Stop microphone
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      setIsMicActive(false);
      
      // Resume music after delay if it was paused by mic
      if (wasPausedByMic) {
        micTimeoutRef.current = setTimeout(() => {
          onPlay();
          setWasPausedByMic(false);
        }, 400);
      }
    }
  };
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full"
    >
      {/* Volume Slider Popup - Full Width and More Visible */}
      {showVolumeSlider && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed top-20 left-4 right-4 z-[100] p-8 bg-card/95 backdrop-blur-lg border-2 border-primary/50 rounded-xl shadow-2xl"
          style={{ maxWidth: '600px', margin: '0 auto', left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="flex items-center gap-6">
            <SpeakerHigh size={32} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full h-6 cursor-pointer"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                className="h-[45px] w-24 border-2 text-sm font-medium"
              >
                {isMuted ? <SpeakerX size={20} /> : <SpeakerHigh size={20} />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVolumeSlider(false)}
                className="h-[45px] w-20 border-2 text-sm font-medium"
              >
                ✕
              </Button>
            </div>
          </div>
          <div className="text-lg text-muted-foreground mt-4 text-center font-semibold">
            Volume: {isMuted ? 0 : volume[0]}% {isMicActive && '• Microphone Active'}
          </div>
        </motion.div>
      )}

      {/* Top Control Bar - Increased height to 40px */}
      <div className="flex items-center justify-between gap-4 mb-3 h-[40px]">
        {/* Left side - Volume Control */}
        <Button
          size="sm"
          variant="outline"
          onClick={toggleVolumeSlider}
          className="h-[40px] px-6 text-sm font-medium border-[6px] transition-all duration-200"
        >
          {isMuted ? <SpeakerX size={18} /> : <SpeakerHigh size={18} />}
        </Button>

        {/* Right side - Play/Pause, Mic, and Stop buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant={isMicActive ? "default" : "outline"}
            size="sm"
            onClick={handleMicToggle}
            className={`h-[40px] px-6 text-sm font-medium border-[6px] transition-all duration-200 ${isMicActive ? 'bg-red-500 hover:bg-red-600' : ''}`}
          >
            <Microphone size={18} weight={isMicActive ? "fill" : "regular"} />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={isPlaying ? onPause : onPlay}
            disabled={!currentSong}
            className={`h-[40px] px-8 text-sm font-medium border-[6px] transition-all duration-200 ${
              isPlaying 
                ? 'bg-gray-200 hover:bg-gray-300 border-pink-200 text-gray-700' 
                : 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={20} weight="fill" className="mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play size={20} weight="fill" className="mr-2" />
                Play
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onStop}
            disabled={!currentSong}
            className="h-[48px] px-10 text-sm font-medium bg-red-100 hover:bg-red-200 border-[6px] border-red-300 text-red-800 transition-all duration-200"
          >
            <Square size={22} weight="fill" className="mr-2" />
            Stop
          </Button>
        </div>
      </div>

      {/* Compact Player Card */}
      <Card className="p-3 bg-card/50 backdrop-blur-sm border-primary/20">
        <div className="flex items-center gap-3">
          {/* Compact YouTube Player */}
          <div className="w-24 h-14 bg-secondary rounded overflow-hidden flex-shrink-0">
            <YouTubePlayer
              song={currentSong}
              isPlaying={isPlaying && !isMicActive}
              onEnded={onEnded}
              onReady={() => {}}
              onTimeUpdate={onTimeUpdate}
              compact={true}
              volume={isMuted ? 0 : volume[0]}
            />
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">
              {currentSong?.customName || currentSong?.title || 'No song selected'}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong ? (isMicActive ? 'Microphone active - Music paused' : 'Ready to play') : 'Select a music group to begin'}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}