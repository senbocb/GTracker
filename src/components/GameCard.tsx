"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import RankBadge from './RankBadge';
import { MoreVertical, Camera, Settings2, Globe, Layers, LayoutGrid, RefreshCw } from 'lucide-react';
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
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'game' | 'mode'>('game');
  const [displayMode, setDisplayMode] = useState<'cycle' | 'all' | 'specific'>('cycle');
  const [currentModeIdx, setCurrentModeIdx] = useState(0);

  useEffect(() => {
    const savedConfig = localStorage.getItem(`game_config_${id}`);
    if (savedConfig) setDisplayMode(savedConfig as any);
  }, [id]);

  useEffect(() => {
    if (displayMode === 'cycle' && modes.length > 1) {
      const interval = setInterval(() => {
        setCurrentModeIdx((prev) => (prev + 1) % modes.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [displayMode, modes.length]);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImage(file, 800, 450, 0.7);
        const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
        const updatedGames = savedGames.map((g: any) => {
          if (g.id === id) {
            if (uploadTarget === 'game') return { ...g, image: processed };
            const newModes = g.modes.map((m: any, idx: number) => 
              (displayMode === 'cycle' ? idx === currentModeIdx : true) ? { ...m, image: processed } : m
            );
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

  const updateDisplayMode = (mode: 'cycle' | 'all' | 'specific') => {
    setDisplayMode(mode);
    localStorage.setItem(`game_config_${id}`, mode);
    showSuccess(`Display mode set to ${mode}.`);
  };

  const displayedModes = displayMode === 'cycle' ? [modes[currentModeIdx]] : modes;
  const activeBanner = (displayMode === 'cycle' ? modes[currentModeIdx]?.image : null) || image;

  return (
    <Card 
      onClick={() => navigate(`/game/${id}`)}
      className="overflow-hidden bg-slate-900 border-slate-800 group hover:border-indigo-500/50 transition-all duration-300 cursor-pointer hover-highlight"
    >
      <div className="relative h-32 overflow-hidden">
        {activeBanner ? (
          <img src={activeBanner} alt={title} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-slate-800 opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">{title}</h3>
            {displayMode === 'cycle' && modes.length > 1 && (
              <div className="flex items-center gap-1">
                {modes.map((_, i) => (
                  <div key={i} className={cn("h-1 rounded-full transition-all", i === currentModeIdx ? "w-4 bg-indigo-500" : "w-1 bg-slate-700")} />
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-300 hover:text-white h-8 w-8 bg-slate-950/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={(e) => { e.stopPropagation(); setIsConfigOpen(true); }}
            >
              <Settings2 size={14} />
            </Button>
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
      </div>
      <CardContent className="p-5 space-y-4">
        <div className={cn("space-y-3", displayMode === 'all' && "grid grid-cols-2 gap-4 space-y-0")}>
          {displayedModes.map((mode, idx) => (
            <div key={idx} className={cn(
              "flex items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0 animate-in fade-in slide-in-from-right-2 duration-500",
              displayMode === 'all' && "border-none pb-0"
            )}>
              <div className="space-y-0.5">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">{mode.name}</p>
                <RankBadge rank={mode.rank} tier={mode.tier} gameTitle={title} className="scale-90 origin-left" />
              </div>
              {displayMode !== 'all' && (
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Peak</p>
                  <p className="text-xs font-bold text-slate-200">{mode.peakRank || "N/A"}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Display Config Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white">
          <DialogHeader><DialogTitle className="italic uppercase font-black">DISPLAY CONFIG</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-6">
            <Button 
              variant="outline" 
              className={cn("h-24 flex flex-col gap-2 border-slate-800", displayMode === 'cycle' && "border-indigo-500 bg-indigo-500/10")}
              onClick={() => updateDisplayMode('cycle')}
            >
              <RefreshCw size={24} />
              <span className="text-[10px] font-black uppercase">Cycle Modes</span>
            </Button>
            <Button 
              variant="outline" 
              className={cn("h-24 flex flex-col gap-2 border-slate-800", displayMode === 'all' && "border-indigo-500 bg-indigo-500/10")}
              onClick={() => updateDisplayMode('all')}
            >
              <LayoutGrid size={24} />
              <span className="text-[10px] font-black uppercase">Show All</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white">
          <DialogHeader><DialogTitle className="italic uppercase font-black">BANNER CONFIG</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-6">
            <Button variant="outline" className={cn("h-24 flex flex-col gap-2 border-slate-800", uploadTarget === 'game' && "border-indigo-500 bg-indigo-500/10")} onClick={() => setUploadTarget('game')}><Globe size={24} /><span className="text-[10px] font-black uppercase">Global Banner</span></Button>
            <Button variant="outline" className={cn("h-24 flex flex-col gap-2 border-slate-800", uploadTarget === 'mode' && "border-indigo-500 bg-indigo-500/10")} onClick={() => setUploadTarget('mode')}><Layers size={24} /><span className="text-[10px] font-black uppercase">Mode Specific</span></Button>
          </div>
          <DialogFooter><Button className="w-full bg-indigo-600 font-black uppercase py-6" onClick={() => fileInputRef.current?.click()}>SELECT IMAGE</Button></DialogFooter>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GameCard;