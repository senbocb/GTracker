"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Plus, Zap, Trophy, Target, Calendar, Map as MapIcon, Activity } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const AddMatchModal = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'quick' | 'detailed'>('quick');
  const [games, setGames] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    gameId: '',
    gameMode: '',
    rank: '',
    tier: '',
    status: 'update', // 'current', 'peak', 'update'
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

  const handleGameChange = (id: string) => {
    const game = games.find(g => g.id === id);
    setFormData(prev => ({ 
      ...prev, 
      gameId: id, 
      gameMode: game?.modes[0]?.name || '' 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const updatedGames = savedGames.map((g: any) => {
      if (g.id === formData.gameId) {
        const modeIdx = g.modes.findIndex((m: any) => m.name === formData.gameMode);
        if (modeIdx === -1) return g;

        const historyEntry = {
          id: Date.now().toString(),
          rank: formData.rank,
          tier: formData.tier,
          timestamp: new Date(formData.timestamp).toISOString(),
          isPeak: formData.status === 'peak',
          map: formData.map,
          result: formData.result
        };

        const newModes = [...g.modes];
        newModes[modeIdx] = {
          ...g.modes[modeIdx],
          rank: formData.status === 'current' || formData.status === 'peak' ? formData.rank : g.modes[modeIdx].rank,
          tier: formData.status === 'current' || formData.status === 'peak' ? formData.tier : g.modes[modeIdx].tier,
          peakRank: formData.status === 'peak' ? formData.rank : g.modes[modeIdx].peakRank,
          history: [historyEntry, ...(g.modes[modeIdx].history || [])]
        };
        return { ...g, modes: newModes };
      }
      return g;
    });

    localStorage.setItem('combat_games', JSON.stringify(updatedGames));
    
    // Update Profile XP
    const profile = JSON.parse(localStorage.getItem('combat_profile') || '{"xp":0}');
    profile.xp += mode === 'detailed' ? 25 : 10;
    localStorage.setItem('combat_profile', JSON.stringify(profile));

    showSuccess(`${mode === 'quick' ? 'Rank' : 'Match'} logged successfully!`);
    setOpen(false);
    window.location.reload(); // Refresh to sync all components
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
            <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-3 uppercase">
              <Activity className="text-indigo-500" />
              Combat Logger
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex p-1 bg-slate-950 rounded-xl mt-6 border border-slate-800">
            <Button 
              variant="ghost" 
              className={cn("flex-1 text-[10px] font-black uppercase tracking-widest h-10 rounded-lg", mode === 'quick' ? "bg-indigo-600 text-white" : "text-slate-500")}
              onClick={() => setMode('quick')}
            >
              <Zap size={14} className="mr-2" /> Quick Rank
            </Button>
            <Button 
              variant="ghost" 
              className={cn("flex-1 text-[10px] font-black uppercase tracking-widest h-10 rounded-lg", mode === 'detailed' ? "bg-indigo-600 text-white" : "text-slate-500")}
              onClick={() => setMode('detailed')}
            >
              <Swords size={14} className="mr-2" /> Detailed Log
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Operation</Label>
              <Select value={formData.gameId} onValueChange={handleGameChange}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                  <SelectValue placeholder="Select Game" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {games.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Mode</Label>
              <Select value={formData.gameMode} onValueChange={(v) => setFormData({...formData, gameMode: v})}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {games.find(g => g.id === formData.gameId)?.modes.map((m: any) => (
                    <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Rank / Rating</Label>
              <Input 
                value={formData.rank} 
                onChange={(e) => setFormData({...formData, rank: e.target.value})}
                placeholder="e.g. Gold" 
                className="bg-slate-900 border-slate-800 text-white" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Tier / Points</Label>
              <Input 
                value={formData.tier} 
                onChange={(e) => setFormData({...formData, tier: e.target.value})}
                placeholder="e.g. 3 or 25RR" 
                className="bg-slate-900 border-slate-800 text-white" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-500">Rank Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
              <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="update">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-indigo-400" />
                    <span>Standard Update</span>
                  </div>
                </SelectItem>
                <SelectItem value="current">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-emerald-400" />
                    <span>Set as Current Rank</span>
                  </div>
                </SelectItem>
                <SelectItem value="peak">
                  <div className="flex items-center gap-2">
                    <Trophy size={14} className="text-yellow-400" />
                    <span>Set as New Peak</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'detailed' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Map / Arena</Label>
                <div className="relative">
                  <MapIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <Input 
                    value={formData.map} 
                    onChange={(e) => setFormData({...formData, map: e.target.value})}
                    placeholder="e.g. Ascent" 
                    className="bg-slate-900 border-slate-800 pl-10 text-white" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Result</Label>
                <Select value={formData.result} onValueChange={(v) => setFormData({...formData, result: v})}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="win">Victory</SelectItem>
                    <SelectItem value="loss">Defeat</SelectItem>
                    <SelectItem value="draw">Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-500">Timestamp</Label>
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
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-8 rounded-2xl text-lg">
              CONFIRM LOG
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMatchModal;