"use client";

import React, { useState, useEffect } from 'react';
import RankBadge from './RankBadge';
import { MoreVertical, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GameMode {
  name: string;
  rank: string;
  tier?: string;
  peakRank?: string;
}

interface GameListItemProps {
  id: string;
  title: string;
  modes: GameMode[];
  image?: string;
}

const GameListItem = ({ id, title, modes = [], image }: GameListItemProps) => {
  const navigate = useNavigate();
  const [currentModeIdx, setCurrentModeIdx] = useState(0);

  useEffect(() => {
    if (modes.length > 3) {
      const interval = setInterval(() => {
        setCurrentModeIdx((prev) => (prev + 1) % modes.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [modes.length]);

  const displayedModes = modes.length > 3 ? [modes[currentModeIdx]] : modes;

  return (
    <div 
      onClick={() => navigate(`/game/${id}`)}
      className="flex items-center justify-between p-4 bg-slate-900/90 border border-slate-800 rounded-xl cursor-pointer hover-highlight group transition-all backdrop-blur-sm"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 font-black">G</div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{title}</h3>
          {/* Removed the mode text list from here as requested */}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex gap-4">
          {displayedModes.map((mode, idx) => (
            <div key={idx} className="flex flex-col items-end animate-in fade-in slide-in-from-right-1">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">{mode.name}</p>
              <RankBadge rank={mode.rank} tier={mode.tier} gameTitle={title} className="scale-90 origin-right" />
            </div>
          ))}
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
      </div>
    </div>
  );
};

export default GameListItem;