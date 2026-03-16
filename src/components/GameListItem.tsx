"use client";

import React, { useState, useEffect } from 'react';
import RankBadge from './RankBadge';
import { MoreVertical, ChevronRight, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GameMode {
  name: string;
  rank: string;
  tier?: string;
  peak_rank?: string;
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
    if (modes.length > 1) {
      const interval = setInterval(() => {
        setCurrentModeIdx((prev) => (prev + 1) % modes.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [modes.length]);

  const activeMode = modes[currentModeIdx];

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
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeMode?.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current</p>
            <RankBadge rank={activeMode?.rank} tier={activeMode?.tier} gameTitle={title} className="scale-90 origin-right" />
          </div>
          <div className="flex flex-col items-end min-w-[80px]">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Peak</p>
            <div className="flex items-center gap-1 text-indigo-400">
              <Trophy size={10} />
              <span className="text-[10px] font-black uppercase italic">{activeMode?.peak_rank || activeMode?.peakRank || "N/A"}</span>
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
      </div>
    </div>
  );
};

export default GameListItem;