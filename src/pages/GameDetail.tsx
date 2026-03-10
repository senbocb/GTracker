"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, Trash2, Zap, History, Plus, Calendar, Clock, Trophy, StickyNote, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import RankBadge from '@/components/RankBadge';
import ProgressChart from '@/components/ProgressChart';
import { showSuccess } from '@/utils/toast';

const GAME_RANKS: Record<string, { ranks: string[] }> = {
  "Valorant": { ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"] },
  "Apex Legends": { ranks: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"] },
  "Overwatch 2": { ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"] },
  "League of Legends": { ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"] }
};

const FACEIT_LEVELS = Array.from({ length: 10 }, (_, i) => `Level ${i + 1}`);

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [activeMode, setActiveMode] = useState('');
  const [timeFrame, setTimeFrame] = useState('week');
  const [notes, setNotes] = useState('');
  
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
      setNotes(found.notes || '');
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const handleSaveNotes = () => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const updated = savedGames.map((g: any) => g.id === id ? { ...g, notes } : g);
    localStorage.setItem('combat_games', JSON.stringify(updated));
    showSuccess("Tactical notes updated.");
  };

  const handleLogRank = () => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const updatedGames = savedGames.map((g: any) => {
      if (g.id === id) {
        const modeIdx = g.modes.findIndex((m: any) => m.name === activeMode);
        if (modeIdx === -1) return g;

        const historyEntry = {
          id: Date.now().toString(),
          rank: logData.rank,
          tier: logData.tier,
          timestamp: new Date(logData.timestamp).toISOString(),
          isPeak: logData.isPeak
        };

        const updatedMode = {
          ...g.modes[modeIdx],
          rank: logData.rank,
          tier: logData.tier,
          peakRank: logData.isPeak ? logData.rank : g.modes[modeIdx].peakRank,
          history: [historyEntry, ...(g.modes[modeIdx].history || [])].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
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

  const handleDelete = () => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const filtered = savedGames.filter((g: any) => g.id !== id);
    localStorage.setItem('combat_games', JSON.stringify(filtered));
    showSuccess(`${game.title} tracker decommissioned.`);
    navigate('/');
  };

  if (!game) return null;

  const currentModeData = game.modes.find((m: any) => m.name === activeMode);
  
  const getFilteredChartData = () => {
    if (!currentModeData?.history) return [];
    return currentModeData.history.map((h: any) => ({
      date: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      rr: activeMode === 'Premier' ? parseInt(h.rank) : (GAME_RANKS[game.title]?.ranks.indexOf(h.rank) + 1) * 100 || 0
    })).reverse();
  };

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
                <Button className="bg-blue-600 hover:bg-blue-500">
                  <Plus size={16} className="mr-2" /> Log Rank Change
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle className="italic uppercase font-black">Log Combat Data: {activeMode}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">New Rank</Label>
                    {activeMode === 'Premier' ? (
                      <Input 
                        type="number" 
                        value={logData.rank} 
                        onChange={(e) => setLogData({...logData, rank: e.target.value})}
                        className="bg-slate-900 border-slate-800"
                      />
                    ) : (
                      <Select onValueChange={(v) => setLogData({...logData, rank: v})} value={logData.rank}>
                        <SelectTrigger className="bg-slate-900 border-slate-800">
                          <SelectValue placeholder="Select Rank" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {activeMode === 'Faceit' ? (
                            FACEIT_LEVELS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                          ) : (
                            GAME_RANKS[game.title]?.ranks.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Peak Rank?</Label>
                    <Switch checked={logData.isPeak} onCheckedChange={(v) => setLogData({...logData, isPeak: v})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleLogRank} className="w-full bg-blue-600 font-black uppercase">Confirm Log</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={handleDelete}>
              <Trash2 size={16} className="mr-2" /> Decommission
            </Button>
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
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="text-blue-500" size={20} />
                  PERFORMANCE ANALYTICS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart data={getFilteredChartData()} />
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <StickyNote className="text-blue-500" size={20} />
                  TACTICAL NOTES
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Log tactical improvements, agent strategies, or map-specific notes..." 
                  className="bg-slate-950 border-slate-800 min-h-[150px] text-slate-300"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button onClick={handleSaveNotes} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold">
                  <Save size={16} className="mr-2" /> Save Tactical Notes
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="text-blue-500" size={20} />
                  COMBAT LOGS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(currentModeData?.history || []).map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-1 h-8 rounded-full ${h.isPeak ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-blue-600'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-white uppercase">{h.rank} {h.tier}</p>
                          {h.isPeak && <Trophy size={12} className="text-yellow-500" />}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(h.timestamp).toLocaleString()}</p>
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
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Operational Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase">Peak Rank</span>
                  <span className="font-black text-yellow-500">{currentModeData?.peakRank || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase">Win Rate</span>
                  <span className="font-black text-emerald-400">{game.winRate || '0%'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase">Playtime</span>
                  <span className="font-black text-blue-400">{game.hoursPlayed || '0h'}</span>
                </div>
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