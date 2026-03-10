"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, Trash2, Zap, History, Plus, Calendar, Clock, Trophy, StickyNote, Save, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import RankBadge from '@/components/RankBadge';
import ProgressChart from '@/components/ProgressChart';
import { showSuccess } from '@/utils/toast';

const GAME_RANKS: Record<string, { ranks: string[] }> = {
  "Valorant": { ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"] },
  "Apex Legends": { ranks: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"] },
  "Overwatch 2": { ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"] },
  "League of Legends": { ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"] },
  "Counter-Strike 2": { ranks: [] } // CS2 uses numeric rating for Premier
};

const FACEIT_LEVELS = Array.from({ length: 10 }, (_, i) => `Level ${i + 1}`);

type SortMetric = 'time' | 'rank' | 'peak';
type SortOrder = 'asc' | 'desc';

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [activeMode, setActiveMode] = useState('');
  const [externalLinks, setExternalLinks] = useState<any[]>([]);
  const [timePeriod, setTimePeriod] = useState('all');
  
  const [sortMetric, setSortMetric] = useState<SortMetric>('time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [logData, setLogData] = useState({
    rank: '',
    tier: '',
    timestamp: new Date().toISOString().slice(0, 16),
    isPeak: false
  });
  const [isLogOpen, setIsLogOpen] = useState(false);

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const found = savedGames.find((g: any) => g.id === id);
    if (found) {
      setGame(found);
      setActiveMode(found.modes[0]?.name || '');
      setExternalLinks(found.externalLinks || []);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const currentModeData = useMemo(() => {
    return game?.modes.find((m: any) => m.name === activeMode);
  }, [game, activeMode]);

  const ranks = useMemo(() => {
    if (activeMode === 'Faceit') return FACEIT_LEVELS;
    return GAME_RANKS[game?.title]?.ranks || [];
  }, [game, activeMode]);

  const compareRanks = (rankA: string, rankB: string) => {
    if (game?.title === 'Counter-Strike 2' && activeMode === 'Premier') {
      return parseInt(rankA) - parseInt(rankB);
    }
    return ranks.indexOf(rankA) - ranks.indexOf(rankB);
  };

  const sortedHistory = useMemo(() => {
    if (!currentModeData?.history) return [];
    
    return [...currentModeData.history].sort((a, b) => {
      let comparison = 0;
      if (sortMetric === 'time') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortMetric === 'rank') {
        comparison = compareRanks(a.rank, b.rank);
      } else if (sortMetric === 'peak') {
        comparison = (a.isPeak ? 1 : 0) - (b.isPeak ? 1 : 0);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [currentModeData, sortMetric, sortOrder, game, ranks]);

  const chartData = useMemo(() => {
    if (!currentModeData?.history) return [];
    
    let history = [...currentModeData.history].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const now = new Date();
    if (timePeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      history = history.filter(h => new Date(h.timestamp) >= weekAgo);
    } else if (timePeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      history = history.filter(h => new Date(h.timestamp) >= monthAgo);
    }

    let currentPeakValue = 0;
    
    return history.map((h: any) => {
      let rankValue = 0;
      if (game?.title === 'Counter-Strike 2' && activeMode === 'Premier') {
        rankValue = parseInt(h.rank);
      } else {
        rankValue = (ranks.indexOf(h.rank) + 1) * 100;
      }

      if (rankValue > currentPeakValue) currentPeakValue = rankValue;
      
      return {
        date: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        current: rankValue,
        peak: currentPeakValue
      };
    });
  }, [currentModeData, timePeriod, game, ranks]);

  const handleLogRank = () => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const updatedGames = savedGames.map((g: any) => {
      if (g.id === id) {
        const modeIdx = g.modes.findIndex((m: any) => m.name === activeMode);
        if (modeIdx === -1) return g;

        const currentPeak = g.modes[modeIdx].peakRank || '0';
        const isNewPeak = compareRanks(logData.rank, currentPeak) > 0;

        const historyEntry = {
          id: Date.now().toString(),
          rank: logData.rank,
          tier: logData.tier,
          timestamp: new Date(logData.timestamp).toISOString(),
          isPeak: isNewPeak || logData.isPeak
        };

        const updatedMode = {
          ...g.modes[modeIdx],
          rank: logData.rank,
          tier: logData.tier,
          peakRank: isNewPeak ? logData.rank : g.modes[modeIdx].peakRank,
          history: [historyEntry, ...(g.modes[modeIdx].history || [])]
        };

        const newModes = [...g.modes];
        newModes[modeIdx] = updatedMode;
        return { ...g, modes: newModes };
      }
      return g;
    });

    localStorage.setItem('combat_games', JSON.stringify(updatedGames));
    setGame(updatedGames.find((g: any) => g.id === id));
    setIsLogOpen(false);
    showSuccess("Rank update logged.");
  };

  const handleAddExternalLink = () => {
    const name = prompt("Enter site name (e.g. Tracker.gg):");
    const url = prompt("Enter URL:");
    if (name && url) {
      const newLinks = [...externalLinks, { name, url: url.startsWith('http') ? url : `https://${url}` }];
      setExternalLinks(newLinks);
      const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
      const updated = savedGames.map((g: any) => g.id === id ? { ...g, externalLinks: newLinks } : g);
      localStorage.setItem('combat_games', JSON.stringify(updated));
      showSuccess("External tracker added.");
    }
  };

  const toggleSort = (metric: SortMetric) => {
    if (sortMetric === metric) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMetric(metric);
      setSortOrder('desc');
    }
  };

  if (!game) return null;

  const isCS2Premier = game.title === 'Counter-Strike 2' && activeMode === 'Premier';

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white -ml-4">
              <ChevronLeft className="mr-2" size={20} />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex gap-2">
            <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-500 font-bold">
                  <Plus size={16} className="mr-2" /> LOG RANK CHANGE
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle className="italic uppercase font-black">LOG COMBAT DATA: {activeMode}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">New Rank / Rating</Label>
                    {isCS2Premier ? (
                      <Input 
                        type="number" 
                        min="1" 
                        max="40000" 
                        placeholder="Enter Rating (1-40000)"
                        value={logData.rank}
                        onChange={(e) => setLogData({...logData, rank: e.target.value})}
                        className="bg-slate-900 border-slate-800 text-white"
                      />
                    ) : (
                      <Select onValueChange={(v) => setLogData({...logData, rank: v})} value={logData.rank}>
                        <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                          <SelectValue placeholder="Select Rank" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {ranks.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Log Date</Label>
                    <Input 
                      type="datetime-local" 
                      value={logData.timestamp} 
                      onChange={(e) => setLogData({...logData, timestamp: e.target.value})}
                      className="bg-slate-900 border-slate-800 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleLogRank} className="w-full bg-blue-600 font-black uppercase py-6">Confirm Log</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative h-64 rounded-3xl overflow-hidden border border-slate-800 mb-10">
          {game.image ? (
            <img src={game.image} alt={game.title} className="w-full h-full object-cover opacity-50" />
          ) : (
            <div className="w-full h-full bg-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-4">{game.title}</h1>
              <Tabs value={activeMode} onValueChange={setActiveMode} className="w-full">
                <TabsList className="bg-slate-950/50 border border-slate-800 p-1 h-auto">
                  {game.modes.map((m: any) => (
                    <TabsTrigger key={m.name} value={m.name} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      {m.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Status</p>
              <RankBadge rank={currentModeData?.rank} tier={currentModeData?.tier} className="scale-110" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <ProgressChart data={chartData} rankNames={isCS2Premier ? [] : ranks} />

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="text-blue-500" size={20} />
                  COMBAT LOGS
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`text-[10px] font-bold uppercase ${sortMetric === 'time' ? 'text-blue-500' : 'text-slate-500'}`}
                    onClick={() => toggleSort('time')}
                  >
                    Time {sortMetric === 'time' && (sortOrder === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`text-[10px] font-bold uppercase ${sortMetric === 'rank' ? 'text-blue-500' : 'text-slate-500'}`}
                    onClick={() => toggleSort('rank')}
                  >
                    Rank {sortMetric === 'rank' && (sortOrder === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sortedHistory.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-1 h-8 rounded-full ${h.isPeak ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-blue-600'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-white uppercase">{h.rank} {h.tier}</p>
                          {h.isPeak && <Trophy size={12} className="text-yellow-500" />}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {new Date(h.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">External Trackers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {externalLinks.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all group"
                  >
                    <span className="text-xs font-bold text-white uppercase">{link.name}</span>
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-blue-500" />
                  </a>
                ))}
                <Button variant="ghost" className="w-full border border-dashed border-slate-800 text-slate-500 hover:text-white text-[10px] font-bold uppercase" onClick={handleAddExternalLink}>
                  <Plus size={12} className="mr-2" /> Add Tracker Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
};

export default GameDetail;