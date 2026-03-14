"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Plus, Zap, Trophy, Target, Calendar, Map as MapIcon, Activity, BarChart3, User, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const FACEIT_RANKS = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9", "Level 10"];
const CS2_MAPS = ["Anubis", "Overpass", "Inferno", "Mirage", "Dust 2", "Nuke", "Ancient", "Train", "Vertigo", "Warden", "Stronghold", "Alpine", "Office", "Italy"];

const GAME_METADATA: Record<string, any> = {
  "Valorant": { 
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"],
    tierCount: 3,
    noTierRanks: ["Radiant"],
    stats: ["Kills", "Deaths", "Assists", "ACS"],
    agents: ["Jett", "Raze", "Breach", "Omen", "Killjoy", "Sage", "Sova", "Viper", "Cypher", "Reyna", "Brimstone", "Phoenix", "Sage", "Sova", "Viper", "Cypher", "Reyna", "Killjoy", "Skye", "Yoru", "Astra", "KAY/O", "Chamber", "Neon", "Fade", "Harbor", "Gekko", "Deadlock", "Iso", "Clove"]
  },
  "Overwatch 2": { 
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"],
    tierCount: 5,
    noTierRanks: ["Top 500"],
    stats: ["Kills", "Deaths", "Damage", "Healing", "Mitigated"]
  },
  "League of Legends": { 
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"],
    tierCount: 4,
    noTierRanks: ["Master", "Grandmaster", "Challenger"],
    stats: ["Kills", "Deaths", "Assists", "CS", "Gold"]
  },
  "Apex Legends": { 
    ranks: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"],
    tierCount: 4,
    noTierRanks: ["Master", "Apex Predator"],
    stats: ["Kills", "Damage", "Placement"]
  },
  "Counter-Strike 2": { 
    ranks: ["Silver I", "Silver II", "Silver III", "Silver IV", "Silver Elite", "Silver Elite Master", "Gold Nova I", "Gold Nova II", "Gold Nova III", "Gold Nova Master", "Master Guardian I", "Master Guardian II", "Master Guardian Elite", "Distinguished Master Guardian", "Legendary Eagle", "Legendary Eagle Master", "Supreme Master First Class", "The Global Elite"], 
    tierCount: 0,
    stats: ["Kills", "Deaths", "ADR"]
  },
  "osu!": {
    ranks: [],
    tierCount: 0,
    stats: ["PP", "Accuracy", "Global Rank", "Play Count"]
  },
  "Rainbow Six Siege": {
    ranks: ["Copper", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Champion"],
    tierCount: 5,
    noTierRanks: ["Champion"],
    stats: ["Kills", "Deaths", "Assists", "KOST"]
  },
  "The Finals": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ruby"],
    tierCount: 4,
    noTierRanks: ["Ruby"],
    stats: ["Kills", "Deaths", "Combat Score", "Support Score"]
  },
  "Marvel Rivals": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Grandmaster", "Celestial", "Eternity"],
    tierCount: 3,
    noTierRanks: ["Eternity"],
    stats: ["Kills", "Deaths", "Damage", "Healing"]
  },
  "Aim Lab": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"],
    tierCount: 0,
    noTierRanks: [],
    stats: ["Score", "Accuracy", "Reaction Time"]
  }
};

const AddMatchModal = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'quick' | 'detailed'>('quick');
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    gameId: '',
    modeId: '',
    rank: '',
    tier: '',
    map: '',
    result: 'win',
    agent: '',
    stats: {},
    timestamp: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    if (open && user) {
      fetchGames();
    }
  }, [open, user]);

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*, game_modes(*)')
      .eq('user_id', user?.id);
    
    if (data) {
      setGames(data);
      if (data.length > 0 && !formData.gameId) {
        setFormData((prev: any) => ({ 
          ...prev, 
          gameId: data[0].id,
          modeId: data[0].game_modes[0]?.id || ''
        }));
      }
    }
  };

  const selectedGameObj = useMemo(() => games.find(g => g.id === formData.gameId), [games, formData.gameId]);
  const selectedModeObj = useMemo(() => selectedGameObj?.game_modes.find((m: any) => m.id === formData.modeId), [selectedGameObj, formData.modeId]);
  
  const metadata = useMemo(() => {
    const base = GAME_METADATA[selectedGameObj?.title] || { ranks: [], tierCount: 0, stats: [] };
    if (selectedModeObj?.name === 'Faceit') {
      return { ...base, ranks: FACEIT_RANKS, tierCount: 0 };
    }
    return base;
  }, [selectedGameObj, selectedModeObj]);

  const isCS2PerMap = selectedGameObj?.title === 'Counter-Strike 2' && selectedModeObj?.name === 'Competitive (Per Map)';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.modeId) return;

    setLoading(true);
    try {
      // 1. Update Mode Rank (Only if not per-map, or update global if desired)
      if (!isCS2PerMap) {
        const { error: modeError } = await supabase
          .from('game_modes')
          .update({
            rank: formData.rank || selectedModeObj.rank,
            tier: formData.tier || selectedModeObj.tier
          })
          .eq('id', formData.modeId);
        
        if (modeError) throw modeError;
      }

      // 2. Insert History Entry
      const { error: historyError } = await supabase
        .from('game_history')
        .insert({
          mode_id: formData.modeId,
          rank: formData.rank,
          tier: formData.tier,
          map: formData.map,
          result: formData.result,
          agent: formData.agent,
          stats: formData.stats,
          timestamp: new Date(formData.timestamp).toISOString()
        });
      
      if (historyError) throw historyError;

      showSuccess("Combat data archived.");
      setOpen(false);
      window.location.reload();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-8 rounded-2xl shadow-lg shadow-indigo-600/20 group transition-all hover:scale-[1.02]">
          <Plus className="mr-2 group-hover:rotate-90 transition-transform" size={20} />
          LOG COMBAT DATA
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-[500px] p-0 overflow-hidden">
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
              <Swords size={14} className="mr-2" /> Match Log
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-300">Operation</Label>
              <Select value={formData.gameId} onValueChange={(v) => {
                const g = games.find(x => x.id === v);
                setFormData({...formData, gameId: v, modeId: g?.game_modes[0]?.id || ''});
              }}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                  <SelectValue placeholder="Select Game" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {games.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-300">Mode</Label>
              <Select value={formData.modeId} onValueChange={(v) => setFormData({...formData, modeId: v})}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {selectedGameObj?.game_modes.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            {isCS2PerMap && (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-300">Map / Arena</Label>
                <Select value={formData.map} onValueChange={(v) => setFormData({...formData, map: v})}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                    <SelectValue placeholder="Select Map" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {CS2_MAPS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-300">New Rank</Label>
                {metadata.ranks.length > 0 ? (
                  <Select value={formData.rank} onValueChange={(v) => setFormData({...formData, rank: v})}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                      <SelectValue placeholder="Select Rank" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {metadata.ranks.map((r: string) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    type="number" 
                    placeholder="Rating" 
                    className="bg-slate-900 border-slate-800"
                    value={formData.rank}
                    onChange={(e) => setFormData({...formData, rank: e.target.value})}
                  />
                )}
              </div>
              {!isCS2PerMap && !isCS2PerMap && metadata.tierCount > 0 && !metadata.noTierRanks?.includes(formData.rank) && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-300">Tier</Label>
                  <Select value={formData.tier} onValueChange={(v) => setFormData({...formData, tier: v})}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {Array.from({ length: metadata.tierCount }, (_, i) => (i + 1).toString()).map(t => (
                        <SelectItem key={t} value={t}>Tier {t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-300">Timestamp</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <Input 
                type="datetime-local" 
                value={formData.timestamp} 
                onChange={(e) => setFormData({...formData, timestamp: e.target.value})}
                className="bg-slate-900 border-slate-800 pl-10" 
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase py-8 rounded-2xl text-lg">
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              {mode === 'quick' ? 'UPDATE RANK' : 'LOG MATCH'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMatchModal;