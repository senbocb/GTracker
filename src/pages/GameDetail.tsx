"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, ExternalLink, Trash2, Target, Zap, Trophy, Calendar, Plus, History } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
const TIERS = ["I", "II", "III"];

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [newRank, setNewRank] = useState({ rank: '', tier: '' });
  const [isLogOpen, setIsLogOpen] = useState(false);

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const found = savedGames.find((g: any) => g.id === id);
    if (found) {
      setGame(found);
      setNewRank({ rank: found.rank, tier: found.tier || '' });
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const handleLogRank = () => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const updatedGames = savedGames.map((g: any) => {
      if (g.id === id) {
        const historyEntry = {
          id: Date.now().toString(),
          rank: newRank.rank,
          tier: newRank.tier,
          timestamp: new Date().toISOString(),
          numericValue: g.mode === 'Premier' ? parseInt(newRank.rank) || 0 : 0 // Simplified
        };
        return {
          ...g,
          rank: newRank.rank,
          tier: newRank.tier,
          history: [historyEntry, ...(g.history || [])]
        };
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

  const chartData = (game.history || [])
    .slice()
    .reverse()
    .map((h: any) => ({
      date: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
      rr: game.mode === 'Premier' ? parseInt(h.rank) : (GAME_RANKS[game.title]?.ranks.indexOf(h.rank) + 1) * 100 || 0
    }));

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
                  <DialogTitle>LOG RANK UPDATE</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>New Rank</Label>
                    {game.mode === 'Premier' ? (
                      <Input 
                        type="number" 
                        value={newRank.rank} 
                        onChange={(e) => setNewRank({...newRank, rank: e.target.value})}
                        className="bg-slate-900 border-slate-800"
                      />
                    ) : (
                      <Select onValueChange={(v) => setNewRank({...newRank, rank: v})} value={newRank.rank}>
                        <SelectTrigger className="bg-slate-900 border-slate-800">
                          <SelectValue placeholder="Select Rank" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {game.mode === 'Faceit' ? (
                            FACEIT_LEVELS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                          ) : (
                            GAME_RANKS[game.title]?.ranks.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  {!(game.mode === 'Premier' || game.mode === 'Faceit') && (
                    <div className="grid gap-2">
                      <Label>Tier</Label>
                      <Select onValueChange={(v) => setNewRank({...newRank, tier: v})} value={newRank.tier}>
                        <SelectTrigger className="bg-slate-900 border-slate-800">
                          <SelectValue placeholder="Select Tier" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {TIERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleLogRank} className="w-full bg-blue-600">Confirm Update</Button>
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
          <div className="absolute bottom-8 left-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{game.title}</h1>
              {game.mode && <span className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest">{game.mode}</span>}
            </div>
            <div className="flex items-center gap-4">
              <RankBadge rank={game.rank} tier={game.tier} className="scale-110" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="text-blue-500" size={20} />
                  RANK PROGRESSION
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart data={chartData} />
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="text-blue-500" size={20} />
                  RANK CHANGE LOG
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(game.history || []).map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-1 h-8 bg-blue-600 rounded-full" />
                      <div>
                        <p className="font-black text-white uppercase">{h.rank} {h.tier}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {new Date(h.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Logged</span>
                    </div>
                  </div>
                ))}
                {(!game.history || game.history.length === 0) && (
                  <div className="text-center py-12">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No rank changes logged</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Combat Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase">Peak Rank</span>
                  <span className="font-black text-white">{game.peakRank || 'N/A'}</span>
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