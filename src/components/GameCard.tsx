"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import RankBadge from './RankBadge';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  id: string;
  title: string;
  modes: any[];
  image?: string;
}

const GameCard = ({ id, title, modes = [], image }: GameCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate(`/game/${id}`)}
      className="overflow-hidden bg-slate-900/40 border-slate-800/50 group hover:border-indigo-500/50 transition-all duration-300 cursor-pointer saas-shadow rounded-2xl"
    >
      <div className="relative h-32 overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-slate-800 opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-full bg-black/20 backdrop-blur-sm">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="space-y-3">
          {modes.slice(0, 2).map((mode, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 group/mode hover:bg-slate-900/50 transition-colors">
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{mode.name}</p>
                <RankBadge rank={mode.rank} tier={mode.tier} gameTitle={title} className="scale-90 origin-left" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Peak</p>
                <p className="text-xs font-medium text-slate-300">{mode.peakRank || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between text-indigo-400 group-hover:text-indigo-300 transition-colors">
          <span className="text-xs font-semibold uppercase tracking-wider">View Details</span>
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;