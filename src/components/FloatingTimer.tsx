"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Timer as TimerIcon, Pin, X, GripHorizontal, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const FloatingTimer = () => {
  const [pos, setPos] = useState({ x: window.innerWidth - 300, y: 100 });
  const [size, setSize] = useState({ width: 260, height: 140 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('00:00:00');

  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = localStorage.getItem('timer_floating_active') === 'true';
    const pinned = localStorage.getItem('timer_pinned') === 'true';
    const savedPos = JSON.parse(localStorage.getItem('timer_pos') || 'null');
    const savedSize = JSON.parse(localStorage.getItem('timer_size') || 'null');

    setIsVisible(active);
    setIsPinned(pinned);
    if (savedPos) setPos(savedPos);
    if (savedSize) setSize(savedSize);

    const interval = setInterval(() => {
      setTimeDisplay(localStorage.getItem('timer_display_value') || '00:00:00');
      setIsVisible(localStorage.getItem('timer_floating_active') === 'true');
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPinned) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleResizeDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPos = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
        setPos(newPos);
        localStorage.setItem('timer_pos', JSON.stringify(newPos));
      }
      if (isResizing) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        const newSize = { 
          width: Math.max(200, size.width + dx), 
          height: Math.max(120, size.height + dy) 
        };
        setSize(newSize);
        setDragStart({ x: e.clientX, y: e.clientY });
        localStorage.setItem('timer_size', JSON.stringify(newSize));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, size]);

  if (!isVisible) return null;

  // Calculate font size based on width
  const fontSize = Math.min(size.width / 5, size.height / 2);

  return (
    <div 
      ref={windowRef}
      className={cn(
        "fixed z-[100] bg-slate-950/90 border border-indigo-500/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-shadow",
        isDragging && "shadow-indigo-500/20 scale-[1.02]",
        isPinned && "border-indigo-500/20"
      )}
      style={{ 
        left: pos.x, 
        top: pos.y, 
        width: size.width, 
        height: size.height,
        touchAction: 'none'
      }}
    >
      {/* Header / Drag Handle */}
      <div 
        className={cn(
          "h-8 flex items-center justify-between px-3 border-b border-slate-800/50 select-none",
          !isPinned ? "cursor-grab active:cursor-grabbing bg-slate-900/50" : "bg-transparent"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <TimerIcon size={12} className="text-indigo-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tactical Timer</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-5 w-5", isPinned ? "text-indigo-500" : "text-slate-600")}
            onClick={() => {
              const next = !isPinned;
              setIsPinned(next);
              localStorage.setItem('timer_pinned', next.toString());
            }}
          >
            <Pin size={10} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 text-slate-600 hover:text-red-500"
            onClick={() => {
              setIsVisible(false);
              localStorage.setItem('timer_floating_active', 'false');
            }}
          >
            <X size={10} />
          </Button>
        </div>
      </div>

      {/* Time Display */}
      <Link 
        to="/timer" 
        className="flex-1 flex items-center justify-center hover:bg-white/5 transition-colors group relative"
      >
        <span 
          className="font-black font-mono text-white tracking-tighter leading-none"
          style={{ fontSize: `${fontSize}px` }}
        >
          {timeDisplay}
        </span>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 size={12} className="text-slate-500" />
        </div>
      </Link>

      {/* Resize Handle */}
      {!isPinned && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-0.5 group"
          onMouseDown={handleResizeDown}
        >
          <div className="w-1.5 h-1.5 bg-slate-700 rounded-full group-hover:bg-indigo-500 transition-colors" />
        </div>
      )}
    </div>
  );
};

export default FloatingTimer;