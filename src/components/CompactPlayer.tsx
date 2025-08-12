import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, SpeakerHigh, SpeakerX, Microphone } from '@phosphor-icons/react';
import { Song } from '@/lib/types';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { motion, AnimatePresence } from 'framer-motion';

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
  const audioContextRef = useRef<AudioContext | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Clean up microphone stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
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
    // Auto-close after 2 seconds of no changes
    setTimeout(() => {
      setShowVolumeSlider(false);
    }, 2000);
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
        
        // Create audio context for speaker output
        audioContextRef.current = new AudioContext();
        micSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        
        // Connect microphone to speakers
        micSourceRef.current.connect(audioContextRef.current.destination);
        
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
      // Stop microphone and audio context
      if (micSourceRef.current) {
        micSourceRef.current.disconnect();
        micSourceRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
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
      <AnimatePresence>
        {showVolumeSlider && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-0 right-0 z-[200] mx-4"
          >
            <div className="max-w-2xl mx-auto p-6 bg-card/98 backdrop-blur-xl border-2 border-primary/60 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-6">
                <SpeakerHigh size={36} className="text-primary flex-shrink-0" />
                <div className="flex-1">
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-full h-8 cursor-pointer"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMute}
                    className="h-[48px] w-28 border-2 text-sm font-medium"
                  >
                    {isMuted ? <SpeakerX size={22} /> : <SpeakerHigh size={22} />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVolumeSlider(false)}
                    className="h-[48px] w-24 border-2 text-sm font-medium"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="text-xl text-muted-foreground mt-4 text-center font-bold">
                Volume: {isMuted ? 0 : volume[0]}% {isMicActive && '• Microphone Active'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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