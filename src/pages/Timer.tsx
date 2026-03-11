"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Timer as TimerIcon, Play, Pause, RotateCcw, Bell, BellOff, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [inputTime, setInputTime] = useState({ h: 0, m: 0, s: 0 });
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isWindowed, setIsWindowed] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 600, height: 500 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resizableRef = useRef<HTMLDivElement>(null);

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
  };

  const pauseTimer = () => setIsActive(false);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      triggerAlarm();
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
    setTimeLeft(m * 60);
    startTimer();
  };

  return (
    <AppLayout>
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4">
              <TimerIcon className="text-indigo-500" size={36} />
              Tactical Timer
            </h1>
            <p className="text-slate-400 font-medium">Precision countdown for training sessions and operational breaks.</p>
          </div>
          <Button 
            variant="outline" 
            className="border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white"
            onClick={() => setIsWindowed(!isWindowed)}
          >
            {isWindowed ? <Minimize2 className="mr-2" size={18} /> : <Maximize2 className="mr-2" size={18} />}
            {isWindowed ? 'Standard View' : 'Windowed Mode'}
          </Button>
        </div>

        <div className={cn(
          "grid grid-cols-1 gap-8 transition-all duration-500",
          isWindowed ? "flex items-center justify-center min-h-[60vh]" : ""
        )}>
          <Card 
            ref={resizableRef}
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
              "p-10 flex flex-col items-center justify-center h-full",
              isWindowed ? "p-6" : ""
            )}>
              <div className={cn(
                "font-black text-white tabular-nums tracking-tighter mb-10 font-mono",
                isWindowed ? "text-5xl md:text-7xl" : "text-7xl md:text-9xl"
              )}>
                {formatTime(timeLeft || (inputTime.h * 3600 + inputTime.m * 60 + inputTime.s))}
              </div>

              <div className={cn("flex flex-wrap justify-center gap-4 mb-10", isWindowed ? "mb-6" : "")}>
                <Button 
                  size="lg" 
                  onClick={isActive ? pauseTimer : startTimer}
                  className={cn(
                    "h-16 px-8 rounded-2xl font-black uppercase italic tracking-tight text-lg", 
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
                    "h-16 px-8 rounded-2xl border-slate-800 text-slate-400 hover:text-white hover-highlight",
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
                    {isAlarmMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </Button>
                  <div className="w-24">
                    <Slider 
                      value={[volume]} 
                      onValueChange={(v) => setVolume(v[0])} 
                      max={100} 
                      step={1} 
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {!isWindowed && (
                <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Hours</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={inputTime.h} 
                      onChange={(e) => setInputTime({...inputTime, h: parseInt(e.target.value) || 0})}
                      className="bg-slate-950 border-slate-800 h-12 text-center font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Minutes</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="59"
                      value={inputTime.m} 
                      onChange={(e) => setInputTime({...inputTime, m: parseInt(e.target.value) || 0})}
                      className="bg-slate-950 border-slate-800 h-12 text-center font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Seconds</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="59"
                      value={inputTime.s} 
                      onChange={(e) => setInputTime({...inputTime, s: parseInt(e.target.value) || 0})}
                      className="bg-slate-950 border-slate-800 h-12 text-center font-bold"
                    />
                  </div>
                </div>
              )}
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