"use client";

import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import RankBadge from './RankBadge';
import { MoreVertical, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { processImage } from '@/utils/imageProcessing';
import { showSuccess, showError } from '@/utils/toast';

interface GameMode {
  name: string;
  rank: string;
  tier?: string;
  peakRank?: string;
}

interface GameCardProps {
  id: string;
  title: string;
  modes: GameMode[];
  image?: string;
}

const GameCard = ({ id, title, modes = [], image }: GameCardProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImage(file, 800, 450, 0.7);
        const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
        const updatedGames = savedGames.map((g: any) => 
          g.id === id ? { ...g, image: processed } : g
        );
        localStorage.setItem('combat_games', JSON.stringify(updatedGames));
        showSuccess(`${title} banner updated.`);
        window.location.reload();
      } catch (err) {
        showError("Failed to process banner.");
      }
    }
  };

  return (
    <Card 
      onClick={() => navigate(`/game/${id}`)}
      className="overflow-hidden bg-slate-900 border-slate-800 group hover:border-indigo-500/50 transition-all duration-300 cursor-pointer hover-highlight"
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
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-300 hover:text-white h-8 w-8 bg-slate-950/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Camera size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreVertical size={16} />
            </Button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleBannerUpload} 
          />
        </div>
      </div>
      <CardContent className="p-5 space-y-4">
        <div className="space-y-3">
          {modes.map((mode, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">{mode.name}</p>
                <RankBadge rank={mode.rank} tier={mode.tier} gameTitle={title} className="scale-90 origin-left" />
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Peak</p>
                <p className="text-xs font-bold text-slate-200">{mode.peakRank || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;