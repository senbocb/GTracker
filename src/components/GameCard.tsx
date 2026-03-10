"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import RankBadge from './RankBadge';
import { MoreVertical, Target, Zap, ExternalLink, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  id: string;
  title: string;
  rank: string;
  tier?: string;
  peakRank?: string;
  winRate?: string;
  hoursPlayed?: string;
  image?: string;
  trackerLink?: string;
  evxlLink?: string;
}

const GameCard = ({ id, title, rank, tier, peakRank, winRate, hoursPlayed, image, trackerLink, evxlLink }: GameCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate(`/game/${id}`)}
      className="overflow-hidden bg-slate-900 border-slate-800 group hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-32 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">{title}</h3>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-8 w-8" onClick={(e) => e.stopPropagation()}>
            <MoreVertical size={16} />
          </Button>
        </div>
      </div>
      <CardContent className="p-5 space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Current Rank</p>
            <RankBadge rank={rank || "Unranked"} tier={tier} />
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Peak</p>
            <p className="text-sm font-bold text-slate-300">{peakRank || "N/A"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Target size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Win Rate</p>
              <p className="text-sm font-bold text-white">{winRate || "0%"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Zap size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Playtime</p>
              <p className="text-sm font-bold text-white">{hoursPlayed || "0h"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;