"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import RankBadge from './RankBadge';
import { ChevronRight, MoreHorizontal, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import KovaaksBenchmarks from './KovaaksBenchmarks';
import OW2RoleRanks from './OW2RoleRanks';

interface GameCardProps {
  id: string;
  title: string;
  modes: any[];
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

const GameCard = ({ id, title, modes = [], image }: GameCardProps) => {
  const navigate = useNavigate();
  const isKovaaks = title.toLowerCase().includes('kovaaks');
  const isOW2 = title.toLowerCase().includes('overwatch 2');
  
  const bannerImage = image || GAME_BANNERS[title] || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop";

  const getPeakRank = (mode: any) => {
    if (mode.peak_rank && mode.peak_rank !== 'Unranked') return mode.peak_rank;
    if (mode.rank && mode.rank !== 'Unranked') return mode.rank;
    return "N/A";
  };

  return (
    <Card 
      className="overflow-hidden bg-slate-900/40 border-slate-800/50 group hover:border-indigo-500/50 transition-all duration-300 saas-shadow rounded-2xl cursor-pointer h-full flex flex-col"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.interactive-element')) return;
        navigate(`/game/${id}`);
      }}
    >
      <div className="relative h-32 overflow-hidden shrink-0">
        <img src={bannerImage} alt={title} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-full bg-black/20 backdrop-blur-sm">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {isKovaaks && (
            <div className="py-2 interactive-element">
              <KovaaksBenchmarks gameId={id} />
            </div>
          )}
          
          {isOW2 && (
            <div className="py-2 interactive-element">
              <OW2RoleRanks gameId={id} onLogClick={() => navigate(`/game/${id}`)} />
            </div>
          )}

          {modes.map((mode, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 group/mode hover:bg-slate-900/50 transition-colors">
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{mode.name}</p>
                <div className="flex items-center gap-2">
                  <RankBadge rank={mode.rank} tier={mode.tier} gameTitle={title} className="scale-90 origin-left" />
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-indigo-400/60 mb-0.5">
                  <Trophy size={10} />
                  <p className="text-[10px] font-black uppercase tracking-wider">Peak</p>
                </div>
                <p className="text-xs font-black text-indigo-400 uppercase italic leading-none">
                  {getPeakRank(mode)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-end text-indigo-400 group-hover:text-indigo-300 transition-colors shrink-0">
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;