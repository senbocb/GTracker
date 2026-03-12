"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import RankBadge from './RankBadge';
import { Camera, Settings2, Globe, Layers, LayoutGrid } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { processImage } from '@/utils/imageProcessing';
import { showSuccess, showError } from '@/utils/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface GameMode {
  name: string;
  rank: string;
  tier?: string;
  peakRank?: string;
  image?: string;
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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'game' | 'mode'>('game');

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImage(file, 800, 450, 0.7);
        const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
        const updatedGames = savedGames.map((g: any) => {
          if (g.id === id) {
            if (uploadTarget === 'game') return { ...g, image: processed };
            const newModes = g.modes.map((m: any) => ({ ...m, image: processed }));
            return { ...g, modes: newModes };
          }
          return g;
        });
        localStorage.setItem('combat_games', JSON.stringify(updatedGames));
        showSuccess(`${title} banner updated.`);
        setIsUploadOpen(false);
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
          <img src={image} alt={title} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-slate-800 opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">{title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-300 hover:text-white h-8 w-8 bg-slate-950/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
            onClick={(e) => { e.stopPropagation(); setIsUploadOpen(true); }}
          >
            <Camera size={14} />
          </Button>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modes.map((mode, idx) => (
            <div key={idx} className="space-y-1.5 p-2 rounded-xl bg-slate-950/30 border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{mode.name}</p>
              <div className="flex items-center justify-between gap-2">
                <RankBadge rank={mode.rank} tier={mode.tier} gameTitle={title} className="scale-90 origin-left" />
                <div className="text-right">
                  <p className="text-[7px] uppercase tracking-widest text-slate-600 font-bold">Peak</p>
                  <p className="text-[10px] font-bold text-slate-400">{mode.peakRank || "N/A"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white">
          <DialogHeader><DialogTitle className="italic uppercase font-black">Banner Config</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-6">
            <Button variant="outline" className={cn("h-24 flex flex-col gap-2 border-slate-800", uploadTarget === 'game' && "border-indigo-500 bg-indigo-500/10")} onClick={() => setUploadTarget('game')}><Globe size={24} /><span className="text-[10px] font-black uppercase">Global Banner</span></Button>
            <Button variant="outline" className={cn("h-24 flex flex-col gap-2 border-slate-800", uploadTarget === 'mode' && "border-indigo-500 bg-indigo-500/10")} onClick={() => setUploadTarget('mode')}><Layers size={24} /><span className="text-[10px] font-black uppercase">Mode Specific</span></Button>
          </div>
          <DialogFooter><Button className="w-full bg-indigo-600 font-black uppercase py-6" onClick={() => fileInputRef.current?.click()}>Select Image</Button></DialogFooter>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GameCard;