"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, History, Plus, Trophy, ExternalLink, ArrowUp, ArrowDown, Table as TableIcon, Target, Activity, Edit2, Calendar, BarChart3, Map as MapIcon, RefreshCw, Eye, EyeOff, Loader2, Shield, Sword, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RankBadge from '@/components/RankBadge';
import ProgressChart from '@/components/ProgressChart';
import SeasonManager, { Season } from '@/components/SeasonManager';
import TournamentWidget from '@/components/TournamentWidget';
import CS2MapPopup from '@/components/CS2MapPopup';
import AppLayout from '@/components/AppLayout';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_METADATA: Record<string, any> = {
  "Valorant": { ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"], tierCount: 3 },
  "Counter-Strike 2": { 
    ranks: [
      "Silver I", "Silver II", "Silver III", "Silver IV", "Silver Elite", "Silver Elite Master", 
      "Gold Nova I", "Gold Nova II", "Gold Nova III", "Gold Nova Master", 
      "Master Guardian I", "Master Guardian II", "Master Guardian Elite", "Distinguished Master Guardian", 
      "Legendary Eagle", "Legendary Eagle Master", "Supreme Master First Class", "The Global Elite"
    ], 
    tierCount: 0,
    modeRanks: {
      "Faceit": ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9", "Level 10", "Challenger"]
    }
  }
};

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [activeMode, setActiveMode] = useState('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logData, setLogData] = useState({ rank: '', tier: '', map: '', role: '', timestamp: new Date().toISOString().slice(0, 16) });
  const [registryData, setRegistryData] = useState<any>(null);

  useEffect(() => {
    fetchGameData();
    fetchRegistry();
  }, [id]);

  const fetchRegistry = async () => {
    const { data } = await supabase.from('game_registry').select('*');
    if (data) {
      const regMap = data.reduce((acc: any, curr: any) => {
        acc[curr.title] = curr;
        return acc;
      }, {});
      setRegistryData(regMap);
    }
  };

  const fetchGameData = async () => {
    const { data: gameData } = await supabase
      .from('games')
      .select('*, game_modes(*, game_history(*))')
      .eq('id', id)
      .single();
    
    if (gameData) {
      const formatted = {
        ...gameData,
        modes: gameData.game_modes.map((m: any) => ({
          ...m,
          history: m.game_history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        }))
      };
      setGame(formatted);
      const initialMode = formatted.modes[0]?.name || '';
      setActiveMode(initialMode);
      
      const currentMode = formatted.modes.find((m: any) => m.name === initialMode);
      if (currentMode) {
        setLogData(prev => ({ ...prev, rank: currentMode.rank || '', tier: currentMode.tier || '' }));
      }

      const savedSeasons = JSON.parse(localStorage.getItem(`seasons_${id}`) || '[]');
      setSeasons(savedSeasons);
    } else {
      navigate('/');
    }
  };

  const handleLogRank = async () => {
    if (!activeMode || !logData.rank) return;
    setIsSubmitting(true);
    
    try {
      const mode = game.modes.find((m: any) => m.name === activeMode);
      if (!mode) throw new Error("Mode not found");

      const { error: historyError } = await supabase
        .from('game_history')
        .insert({
          mode_id: mode.id,
          rank: logData.rank,
          tier: logData.tier,
          map: logData.map,
          agent: logData.role,
          timestamp: logData.timestamp
        });
      
      if (historyError) throw historyError;

      if (!(game.title === 'Counter-Strike 2' && activeMode === 'Competitive (Per Map)')) {
        const { error: modeError } = await supabase
          .from('game_modes')
          .update({
            rank: logData.rank,
            tier: logData.tier
          })
          .eq('id', mode.id);
        
        if (modeError) throw modeError;
      }

      showSuccess("Rank logged successfully.");
      setIsLogOpen(false);
      fetchGameData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!game) return null;

  // Resolve metadata from registry or defaults
  const registryEntry = registryData?.[game.title];
  const registryMode = registryEntry?.modes?.find((m: any) => m.name === activeMode);
  
  const availableRanks = registryMode?.ranks || DEFAULT_GAMES_FALLBACK[game.title]?.modeRanks?.[activeMode] || DEFAULT_METADATA[game.title]?.ranks || [];
  const rankConfigs = registryMode?.rank_configs || {};
  
  const isCS2PerMap = game.title === 'Counter-Strike 2' && activeMode === 'Competitive (Per Map)';

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto p-4 md:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <Link to="/"><Button variant="ghost" className="text-slate-300 hover:text-white -ml-4"><ChevronLeft className="mr-2" size={20} /> Back</Button></Link>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {isCS2PerMap && (
              <CS2MapPopup gameId={game.id} history={game.modes.find((m: any) => m.name === activeMode)?.history || []} />
            )}
            <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-500 font-bold flex-1 md:flex-none"><Plus size={16} className="mr-2" /> Log Rank</Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-md w-[95vw]">
                <DialogHeader><DialogTitle className="italic uppercase font-black">Log Match Result</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Rank</Label>
                    <Select value={logData.rank} onValueChange={(v) => setLogData({...logData, rank: v})}>
                      <SelectTrigger className="bg-slate-900 border-slate-800">
                        <SelectValue placeholder="Select Rank" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {availableRanks.map((r: string) => {
                          const iconUrl = rankConfigs[r]?.icon_url;
                          return (
                            <SelectItem key={r} value={r}>
                              <div className="flex items-center gap-2">
                                {iconUrl && <img src={iconUrl} alt="" className="w-6 h-6 object-contain" />}
                                {r}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  {isCS2PerMap && (
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Map</Label>
                      <Select value={logData.map} onValueChange={(v) => setLogData({...logData, map: v})}>
                        <SelectTrigger className="bg-slate-900 border-slate-800">
                          <SelectValue placeholder="Select Map" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {["Anubis", "Overpass", "Inferno", "Mirage", "Dust 2", "Nuke", "Ancient", "Train", "Vertigo", "Warden", "Stronghold", "Alpine", "Office", "Italy"].map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Timestamp</Label>
                    <Input type="datetime-local" value={logData.timestamp} onChange={(e) => setLogData({...logData, timestamp: e.target.value})} className="bg-slate-900 border-slate-800" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleLogRank} disabled={isSubmitting} className="w-full bg-indigo-600 font-black uppercase py-6">
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Archive Entry"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative h-48 md:h-64 rounded-2xl md:rounded-3xl overflow-hidden border border-slate-800 mb-8 md:mb-10">
          {game.image ? <img src={game.image} alt={game.title} className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full bg-slate-900" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-2 md:mb-4">{game.title}</h1>
              <Tabs value={activeMode} onValueChange={setActiveMode}>
                <TabsList className="bg-slate-950/50 border border-slate-800 p-1 h-auto flex-wrap">
                  {game.modes.map((m: any) => (
                    <TabsTrigger key={m.name} value={m.name} className="px-4 md:px-6 py-1.5 md:py-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">
                      {m.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <ProgressChart 
              history={game.modes.find((m: any) => m.name === activeMode)?.history} 
              rankNames={availableRanks} 
              getRankValue={(r) => availableRanks.indexOf(r)} 
            />
            <TournamentWidget gameId={id!} />
          </div>
          <div className="space-y-6">
            <SeasonManager gameId={game.id} seasons={seasons} onUpdate={(s) => { setSeasons(s); localStorage.setItem(`seasons_${id}`, JSON.stringify(s)); }} />
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

const DEFAULT_GAMES_FALLBACK: Record<string, any> = {
  "Counter-Strike 2": {
    modeRanks: {
      "Faceit": ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9", "Level 10", "Challenger"]
    }
  }
};

export default GameDetail;