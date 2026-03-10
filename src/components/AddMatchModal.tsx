"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Plus, Zap, Trophy, Target, Calendar, Map as MapIcon, Activity } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const GAME_METADATA: Record<string, { ranks: string[], tierCount: number, noTierRanks: string[], tierDirection: 'asc' | 'desc' }> = {
  "Valorant": { 
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"],
    tierCount: 3,
    noTierRanks: ["Radiant"],
    tierDirection: 'asc'
  },
  "Overwatch 2": { 
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"],
    tierCount: 5,
    noTierRanks: ["Top 500"],
    tierDirection: 'desc' // 1 is highest
  },
  "League of Legends": { 
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"],
    tierCount: 4,
    noTierRanks: ["Master", "Grandmaster", "Challenger"],
    tierDirection: 'desc'
  },
  "Apex Legends": { 
    ranks: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"],
    tierCount: 4,
    noTierRanks: ["Master", "Apex Predator"],
    tierDirection: 'desc'
  },
  "Counter-Strike 2": { 
    ranks: [], 
    tierCount: 0,
    noTierRanks: [],
    tierDirection: 'asc'
  }
};

const getFaceitLevel = (elo: number) => {
  if (elo >= 2001) return "10";
  if (elo >= 1751) return "9";
  if (elo >= 1531) return "8";
  if (elo >= 1351) return "7";
  if (elo >= 1201) return "6";
  if (elo >= 1051) return "5";
  if (elo >= 901) return "4";
  if (elo >= 751) return "3";
  if (elo >= 501) return "2";
  if (elo >= 100) return "1";
  return "1";
};

const AddMatchModal = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'quick' | 'detailed'>('quick');
  const [games, setGames] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    gameId: '',
    gameMode: '',
    rank: '',
    tier: '',
    status: 'update',
    map: '',
    result: 'win',
    timestamp: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_games') || '[]');
    setGames(saved);
    if (saved.length > 0 && !formData.gameId) {
      setFormData(prev => ({ 
        ...prev, 
        gameId: saved[0].id,
        gameMode: saved[0].modes[0]?.name || ''
      }));
    }
  }, [open]);

  const selectedGameObj = useMemo(() => games.find(g => g.id === formData.gameId), [games, formData.gameId]);
  const metadata = useMemo(() => GAME_METADATA[selectedGameObj?.title] || { ranks: [], tierCount: 0, noTierRanks: [], tierDirection: 'asc' }, [selectedGameObj]);

  const isCS2Premier = selectedGameObj?.title === 'Counter-Strike 2' && formData.gameMode === 'Premier';
  const isCS2Faceit = selectedGameObj?.title === 'Counter-Strike 2' && formData.gameMode === 'Faceit';

  const handleGameChange = (id: string) => {
    const game = games.find(g => g.id === id);
    setFormData(prev => ({ 
      ...prev, 
      gameId: id, 
      gameMode: game?.modes[0]?.name || '',
      rank: '',
      tier: ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for OW2 Tiers
    if (selectedGameObj?.title === 'Overwatch 2' && !metadata.noTierRanks.includes(formData.rank) && !formData.tier) {
      showError("Tier is required for Overwatch 2 logs.");
      return;
    }

    let finalRank = formData.rank;
    let finalTier = formData.tier;

    // Auto-calculate Faceit Level
    if (isCS2Faceit) {
      const elo = parseInt(formData.rank);
      if (isNaN(elo)) {
        showError("Please enter a valid ELO number.");
        return;
      }
      finalTier = `Level ${getFaceitLevel(elo)}`;
    }
    
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const updatedGames = savedGames.map((g: any) => {
      if (g.id === formData.gameId) {
        const modeIdx = g.modes.findIndex((m: any) => m.name === formData.gameMode);
        if (modeIdx === -1) return g;

        const historyEntry = {
          id: Date.now().toString(),
          rank: finalRank,
          tier: finalTier,
          timestamp: new Date(formData.timestamp).toISOString(),
          isPeak: formData.status === 'peak',
          map: formData.map,
          result: formData.result
        };

        const newModes = [...g.modes];
        newModes[modeIdx] = {
          ...g.modes[modeIdx],
          rank: formData.status === 'current' || formData.status === 'peak' ? finalRank : g.modes[modeIdx].rank,
          tier: formData.status === 'current' || formData.status === 'peak' ? finalTier : g.modes[modeIdx].tier,
          peakRank: formData.status === 'peak' ? finalRank : g.modes[modeIdx].peakRank,
          history: [historyEntry, ...(g.modes[modeIdx].history || [])]
        };
        return { ...g, modes: newModes };
      }
      return g;
    });

    localStorage.setItem('combat_games', JSON.stringify(updatedGames));
    showSuccess("Combat data logged successfully!");
    setOpen(false);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-8 rounded-2xl shadow-lg shadow-indigo-600/20 group transition-all hover:scale-[1.02]">
          <Plus className="mr-2 group-hover:rotate-90 transition-transform" size={20} />
          LOG COMBAT DATA
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-[450px] p-0 overflow-hidden">
        <div className="bg-slate-900 p-6 border-b border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-3 uppercase text-white">
              <Activity className="text-indigo-500" />
              Combat Logger
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex p-1 bg-slate-950 rounded-xl mt-6 border border-slate-800">
            <Button 
              variant="ghost" 
              className={cn("flex-1 text-[10px] font-black uppercase tracking-widest h-10 rounded-lg", mode === 'quick' ? "bg-indigo-600 text-white" : "text-slate-400")}
              onClick={() => setMode('quick')}
            >
              <Zap size={14} className="mr-2" /> Quick Rank
            </Button>
            <Button 
              variant="ghost" 
              className={cn("flex-1 text-[10px] font-black uppercase tracking-widest h-10 rounded-lg", mode === 'detailed' ? "bg-indigo-600 text-white" : "text-slate-400")}
              onClick={() => setMode('detailed')}
            >
              <Swords size={14} className="mr-2" /> Detailed Log
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-300">Operation</Label>
              <Select value={formData.gameId} onValueChange={handleGameChange}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                  <SelectValue placeholder="Select Game" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {games.map(g => <SelectItem key={g.id} value={g.id} className="focus:bg-indigo-600">{g.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-300">Mode</Label>
              <Select value={formData.gameMode} onValueChange={(v) => setFormData({...formData, gameMode: v, rank: '', tier: ''})}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {selectedGameObj?.modes.map((m: any) => (
                    <SelectItem key={m.name} value={m.name} className="focus:bg-indigo-600">{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-300">
                {isCS2Premier ? 'Rating (1-40,000)' : isCS2Faceit ? 'Faceit ELO' : 'Rank'}
              </Label>
              {isCS2Premier || isCS2Faceit ? (
                <Input 
                  type="number"
                  value={formData.rank} 
                  onChange={(e) => setFormData({...formData, rank: e.target.value})}
                  placeholder={isCS2Faceit ? "e.g. 1250" : "e.g. 15400"} 
                  className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600" 
                  required
                />
              ) : (
                <Select value={formData.rank} onValueChange={(v) => setFormData({...formData, rank: v})}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                    <SelectValue placeholder="Select Rank" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {metadata.ranks.map(r => <SelectItem key={r} value={r} className="focus:bg-indigo-600">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            {!isCS2Premier && !isCS2Faceit && metadata.tierCount > 0 && !metadata.noTierRanks.includes(formData.rank) && (
              <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                <Label className="text-[10px] font-bold uppercase text-slate-300">Tier (1-{metadata.tierCount})</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({...formData, tier: v})}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {Array.from({ length: metadata.tierCount }, (_, i) => (i + 1).toString()).map(t => (
                      <SelectItem key={t} value={t} className="focus:bg-indigo-600">Tier {t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-300">Rank Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
              <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="update" className="focus:bg-indigo-600">Standard Update</SelectItem>
                <SelectItem value="current" className="focus:bg-indigo-600">Set as Current Rank</SelectItem>
                <SelectItem value="peak" className="focus:bg-indigo-600">Set as New Peak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'detailed' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-300">Map / Arena</Label>
                <div className="relative">
                  <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <Input 
                    value={formData.map} 
                    onChange={(e) => setFormData({...formData, map: e.target.value})}
                    placeholder="e.g. Ascent" 
                    className="bg-slate-900 border-slate-800 pl-10 text-white placeholder:text-slate-600" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-300">Result</Label>
                <Select value={formData.result} onValueChange={(v) => setFormData({...formData, result: v})}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="win" className="focus:bg-indigo-600">Victory</SelectItem>
                    <SelectItem value="loss" className="focus:bg-indigo-600">Defeat</SelectItem>
                    <SelectItem value="draw" className="focus:bg-indigo-600">Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-300">Timestamp</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <Input 
                type="datetime-local" 
                value={formData.timestamp} 
                onChange={(e) => setFormData({...formData, timestamp: e.target.value})}
                className="bg-slate-900 border-slate-800 pl-10 text-white" 
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase py-8 rounded-2xl text-lg">
              CONFIRM LOG
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMatchModal;