"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Timer as TimerIcon, Play, Pause, RotateCcw, Bell, BellOff, Maximize2, Minimize2, Volume2, VolumeX, Pin } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [inputTime, setInputTime] = useState({ h: 0, m: 0, s: 0 });
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isWindowed, setIsWindowed] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 600, height: 500 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Direct editing state
  const [editingPart, setEditingPart] = useState<'h' | 'm' | 's' | null>(null);

  const startTimer = () => {
    if (timeLeft === 0) {
      const totalSeconds = inputTime.h * 3600 + inputTime.m * 60 + inputTime.s;
      if (totalSeconds <= 0) {
        showError("Set a valid duration.");
        return;
      }
      setTimeLeft(totalSeconds);
    }
    setIsActive(true);
    localStorage.setItem('timer_floating_active', 'true');
  };

  const pauseTimer = () => setIsActive(false);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    localStorage.setItem('timer_floating_active', 'false');
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          localStorage.setItem('timer_display_value', formatTime(next));
          return next;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      triggerAlarm();
      localStorage.setItem('timer_floating_active', 'false');
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const triggerAlarm = () => {
    if (!isAlarmMuted) {
      showSuccess("OPERATION COMPLETE: Timer Expired!");
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime((volume / 100) * 0.2, context.currentTime);
      osc.start();
      osc.stop(context.currentTime + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const setPreset = (m: number) => {
    resetTimer();
    const total = m * 60;
    setTimeLeft(total);
    setInputTime({ h: Math.floor(m / 60), m: m % 60, s: 0 });
    startTimer();
  };

  const handleNumberEdit = (part: 'h' | 'm' | 's', value: string) => {
    const num = parseInt(value) || 0;
    const max = part === 'h' ? 99 : 59;
    const clamped = Math.min(Math.max(0, num), max);
    
    const newInput = { ...inputTime, [part]: clamped };
    setInputTime(newInput);
    
    if (!isActive) {
      setTimeLeft(newInput.h * 3600 + newInput.m * 60 + newInput.s);
    }
  };

  const togglePin = () => {
    const newState = !isPinned;
    setIsPinned(newState);
    localStorage.setItem('timer_pinned', newState.toString());
  };

  return (
    <AppLayout>
      <main className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4">
              <TimerIcon className="text-indigo-500" size={36} />
              Timer
            </h1>
            <p className="text-slate-400 font-medium text-sm sm:text-base">Precision countdown for training sessions and operational breaks.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className={cn("border-slate-800 bg-slate-900/50", isPinned ? "text-indigo-500 border-indigo-500/50" : "text-slate-400")}
              onClick={togglePin}
            >
              <Pin className="mr-2" size={18} />
              {isPinned ? 'Pinned' : 'Pin Window'}
            </Button>
            <Button 
              variant="outline" 
              className="border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white"
              onClick={() => setIsWindowed(!isWindowed)}
            >
              {isWindowed ? <Minimize2 className="mr-2" size={18} /> : <Maximize2 className="mr-2" size={18} />}
              {isWindowed ? 'Standard' : 'Windowed'}
            </Button>
          </div>
        </div>

        <div className={cn(
          "grid grid-cols-1 gap-8 transition-all duration-500",
          isWindowed ? "flex items-center justify-center min-h-[60vh]" : ""
        )}>
          <Card 
            style={isWindowed ? { 
              width: `${windowSize.width}px`, 
              height: `${windowSize.height}px`,
              resize: 'both',
              overflow: 'auto'
            } : {}}
            className={cn(
              "bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden relative",
              isWindowed ? "shadow-2xl shadow-indigo-500/10" : ""
            )}
          >
            <div className={cn("h-1 w-full transition-all duration-1000", isActive ? "bg-indigo-500 animate-pulse" : "bg-slate-800")} />
            <CardContent className={cn(
              "p-6 sm:p-10 flex flex-col items-center justify-center h-full",
              isWindowed ? "p-6" : ""
            )}>
              {/* HH:MM:SS Labels */}
              <div className="flex gap-4 sm:gap-8 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 w-16 sm:w-24 text-center">Hours</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 w-16 sm:w-24 text-center">Minutes</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 w-16 sm:w-24 text-center">Seconds</span>
              </div>

              {/* Direct Editable Numbers */}
              <div className={cn(
                "font-black text-white tabular-nums tracking-tighter mb-10 font-mono flex items-center gap-2",
                isWindowed ? "text-4xl sm:text-6xl" : "text-6xl sm:text-8xl md:text-9xl"
              )}>
                <div className="flex flex-col items-center">
                  {editingPart === 'h' ? (
                    <input 
                      autoFocus
                      className="bg-indigo-600/20 border-b-2 border-indigo-500 outline-none w-16 sm:w-24 text-center"
                      value={inputTime.h}
                      onChange={(e) => handleNumberEdit('h', e.target.value)}
                      onBlur={() => setEditingPart(null)}
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:text-indigo-400 transition-colors w-16 sm:w-24 text-center"
                      onClick={() => !isActive && setEditingPart('h')}
                    >
                      {Math.floor(timeLeft / 3600).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                <span className="text-slate-700">:</span>
                <div className="flex flex-col items-center">
                  {editingPart === 'm' ? (
                    <input 
                      autoFocus
                      className="bg-indigo-600/20 border-b-2 border-indigo-500 outline-none w-16 sm:w-24 text-center"
                      value={inputTime.m}
                      onChange={(e) => handleNumberEdit('m', e.target.value)}
                      onBlur={() => setEditingPart(null)}
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:text-indigo-400 transition-colors w-16 sm:w-24 text-center"
                      onClick={() => !isActive && setEditingPart('m')}
                    >
                      {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                <span className="text-slate-700">:</span>
                <div className="flex flex-col items-center">
                  {editingPart === 's' ? (
                    <input 
                      autoFocus
                      className="bg-indigo-600/20 border-b-2 border-indigo-500 outline-none w-16 sm:w-24 text-center"
                      value={inputTime.s}
                      onChange={(e) => handleNumberEdit('s', e.target.value)}
                      onBlur={() => setEditingPart(null)}
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:text-indigo-400 transition-colors w-16 sm:w-24 text-center"
                      onClick={() => !isActive && setEditingPart('s')}
                    >
                      {(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>

              <div className={cn("flex flex-wrap justify-center gap-4 mb-10", isWindowed ? "mb-6" : "")}>
                <Button 
                  size="lg" 
                  onClick={isActive ? pauseTimer : startTimer}
                  className={cn(
                    "h-14 sm:h-16 px-6 sm:px-8 rounded-2xl font-black uppercase italic tracking-tight text-base sm:text-lg", 
                    isActive ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white",
                    isWindowed ? "h-12 px-6 text-base" : ""
                  )}
                >
                  {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={resetTimer}
                  className={cn(
                    "h-14 sm:h-16 px-6 sm:px-8 rounded-2xl border-slate-800 text-slate-400 hover:text-white hover-highlight",
                    isWindowed ? "h-12 px-6 text-base" : ""
                  )}
                >
                  <RotateCcw className="mr-2" />
                  Reset
                </Button>
                <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-slate-950/50 border border-slate-800">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsAlarmMuted(!isAlarmMuted)}
                    className="text-slate-500 hover:text-white"
                  >
                    {isAlarmMuted ? <BellOff size={20} /> : <Volume2 size={20} />}
                  </Button>
                  <div className="w-24">
                    <Slider 
                      value={[volume]} 
                      onValueChange={(v) => setVolume(v[0])} 
                      max={100} 
                      step={1} 
                      className="cursor-pointer [&_[data-orientation=horizontal]]:h-2 [&_.relative]:bg-black [&_.absolute]:bg-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isWindowed && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[5, 15, 30, 60].map((m) => (
                <Button 
                  key={m} 
                  variant="outline" 
                  onClick={() => setPreset(m)}
                  className="h-20 rounded-2xl border-slate-800 bg-slate-900/30 hover:border-indigo-500/50 group"
                >
                  <div className="text-center">
                    <p className="text-xl font-black text-white group-hover:text-indigo-400">{m}m</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Preset</p>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default Timer;