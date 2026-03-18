"use client";

import React from 'react';
import RankBadge from './RankBadge';
import { ChevronRight, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const GAME_BANNERS: Record<string, string> = {
  "Valorant": "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=1000&auto=format&fit=crop",
  "Counter-Strike 2": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
  "League of Legends": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
  "Overwatch 2": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop",
  "Apex Legends": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
  "Aim Lab": "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop",
  "Kovaaks": "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1000&auto=format&fit=crop"
};

const GameListItem = ({ id, title, modes = [], image }: GameListItemProps) => {
  const navigate = useNavigate();
  const bannerImage = image || GAME_BANNERS[title] || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop";

  const getPeakRank = (mode: any) => {
    if (!mode) return "N/A";
    const peak = mode.peak_rank || mode.peakRank;
    if (peak && peak !== 'Unranked') return peak;
    if (mode.rank && mode.rank !== 'Unranked') return mode.rank;
    return "N/A";
  };

  return (
    <div 
      onClick={() => navigate(`/game/${id}`)}
      className="flex flex-col p-4 bg-slate-900/90 border border-slate-800 rounded-xl cursor-pointer hover-highlight group transition-all backdrop-blur-sm gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0">
            <img src={bannerImage} alt={title} className="w-full h-full object-cover opacity-60" />
          </div>
          <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{title}</h3>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modes.map((mode, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{mode.name}</p>
              <RankBadge rank={mode.rank} tier={mode.tier} gameTitle={title} className="scale-75 origin-left" />
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Peak</p>
              <div className="flex items-center gap-1 text-indigo-400">
                <Trophy size={10} />
                <span className="text-[10px] font-black uppercase italic">{getPeakRank(mode)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameListItem;