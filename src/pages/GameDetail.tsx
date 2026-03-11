"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, History, Plus, Trophy, ExternalLink, ArrowUp, ArrowDown, Table as TableIcon, Target, Activity, Edit2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RankBadge from '@/components/RankBadge';
import ProgressChart from '@/components/ProgressChart';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const CS_LEGACY_RANKS = [
  "Silver I", "Silver II", "Silver III", "Silver IV", "Silver Elite", "Silver Elite Master",
  "Gold Nova I", "Gold Nova II", "Gold Nova III", "Gold Nova Master",
  "Master Guardian I", "Master Guardian II", "Master Guardian Elite", "Distinguished Master Guardian",
  "Legendary Eagle", "Legendary Eagle Master", "Supreme Master First Class", "The Global Elite"
];

const GAME_METADATA: Record<string, any> = {
  "Valorant": { 
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"],
    tierCount: 3,
    tierDirection: 'asc',
    noTierRanks: ["Radiant"]
  },
  "Overwatch 2": { 
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"],
    tierCount: 5,
    tierDirection: 'desc',
    noTierRanks: ["Top 500"]
  },
  "League of Legends": { 
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"],
    tierCount: 4,
    tierDirection: 'desc',
    noTierRanks: ["Master", "Grandmaster", "Challenger"]
  },
  "Apex Legends": { 
    ranks: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"],
    tierCount: 4,
    tierDirection: 'desc',
    noTierRanks: ["Master", "Apex Predator"]
  },
  "Counter-Strike 2": { 
    ranks: [], 
    tierCount: 0,
    tierDirection: 'asc',
    noTierRanks: []
  },
  "osu!": {
    ranks: [],
    tierCount: 0,
    tierDirection: 'desc',
    noTierRanks: []
  }
};

const OW2_ROLE_ORDER = ["Tank", "Damage", "Support"];
const FACEIT_LEVELS = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

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

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [activeMode, setActiveMode] = useState('');
  const [externalLinks, setExternalLinks] = useState<any[]>([]);
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [logData, setLogData] = useState({
    rank: '',
    tier: '',
    timestamp: new Date().toISOString().slice(0, 16)
  });
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const found = savedGames.find((g: any) => g.id === id);
    if (found) {
      if (found.title === 'Overwatch 2') {
        found.modes.sort((a: any, b: any) => 
          OW2_ROLE_ORDER.indexOf(a.name) - OW2_ROLE_ORDER.indexOf(b.name)
        );
      }
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

  const metadata = useMemo(() => {
    const base = GAME_METADATA[game?.title] || { ranks: [], tierCount: 0, tierDirection: 'asc', noTierRanks: [] };
    if (game?.title === 'Counter-Strike 2' && activeMode === 'Wingman') {
      return { ...base, ranks: CS_LEGACY_RANKS };
    }
    return base;
  }, [game, activeMode]);

  const getRankValue = (rankName: string, tierName?: string) => {
    if (!rankName) return 0;
    
    const numeric = parseInt(rankName.replace(/\D/g, ''));
    
    if (game?.title === 'osu!') {
      return 10000000 - numeric;
    }

    if (game?.title === 'Counter-Strike 2' && activeMode === 'Wingman') {
      return CS_LEGACY_RANKS.indexOf(rankName) + 1;
    }

    if (!isNaN(numeric) && !metadata.ranks.includes(rankName)) return numeric;

    const rankIdx = metadata.ranks.indexOf(rankName);
    if (rankIdx === -1) return 0;

    const tierValue = tierName ? parseInt(tierName.replace(/\D/g, '')) || 0 : 0;
    const baseValue = (rankIdx + 1) * 100;

    if (metadata.noTierRanks.includes(rankName) || metadata.tierCount === 0) {
      return baseValue;
    }

    if (metadata.tierDirection === 'asc') {
      return baseValue + tierValue;
    } else {
      return baseValue + (metadata.tierCount - tierValue + 1);
    }
  };

  const { sortedHistory, currentId, peakId } = useMemo(() => {
    if (!currentModeData?.history || currentModeData.history.length === 0) {
      return { sortedHistory: [], currentId: null, peakId: null };
    }

    const history = [...currentModeData.history];
    const current = history.reduce((prev, curr) => 
      new Date(curr.timestamp) > new Date(prev.timestamp) ? curr : prev
    );

    const peak = history.reduce((prev, curr) => {
      const valPrev = getRankValue(prev.rank, prev.tier);
      const valCurr = getRankValue(curr.rank, curr.tier);
      return valCurr > valPrev ? curr : prev;
    });

    const sorted = history.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return { sortedHistory: sorted, currentId: current.id, peakId: peak.id };
  }, [currentModeData, sortOrder, metadata, game?.title, activeMode]);

  const isFaceit = activeMode === 'Faceit';
  const isOsu = game?.title === 'osu!';

  const handleEloChange = (val: string) => {
    const elo = parseInt(val);
    if (!isNaN(elo)) {
      setLogData({
        ...logData,
        rank: val,
        tier: `Level ${getFaceitLevel(elo)}`
      });
    } else {
      setLogData({ ...logData, rank: val });
    }
  };

  const handleLogRank = () => {
    if (game?.title === 'Overwatch 2' && !metadata.noTierRanks.includes(logData.rank) && !logData.tier) {
      alert("Tier selection is mandatory for Overwatch 2.");
      return;
    }

    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const updatedGames = savedGames.map((g: any) => {
      if (g.id === id) {
        const modeIdx = g.modes.findIndex((m: any) => m.name === activeMode);
        if (modeIdx === -1) return g;

        const newModes = [...g.modes];
        const history = [...(g.modes[modeIdx].history || [])];

        if (editingLogId) {
          const logIdx = history.findIndex(h => h.id === editingLogId);
          if (logIdx > -1) {
            history[logIdx] = {
              ...history[logIdx],
              rank: logData.rank,
              tier: logData.tier,
              timestamp: new Date(logData.timestamp).toISOString()
            };
          }
        } else {
          history.unshift({
            id: Date.now().toString(),
            rank: logData.rank,
            tier: logData.tier,
            timestamp: new Date(logData.timestamp).toISOString()
          });
        }

        const newest = history.reduce((prev, curr) => 
          new Date(curr.timestamp) > new Date(prev.timestamp) ? curr : prev
        );

        newModes[modeIdx] = {
          ...g.modes[modeIdx],
          rank: newest.rank,
          tier: newest.tier,
          history: history
        };
        return { ...g, modes: newModes };
      }
      return g;
    });

    localStorage.setItem('combat_games', JSON.stringify(updatedGames));
    setGame(updatedGames.find((g: any) => g.id === id));
    setIsLogOpen(false);
    setEditingLogId(null);
    showSuccess(editingLogId ? "Log entry updated." : "Rank update logged.");
  };

  const openEditDialog = (log: any) => {
    setEditingLogId(log.id);
    setLogData({
      rank: log.rank,
      tier: log.tier,
      timestamp: new Date(log.timestamp).toISOString().slice(0, 16)
    });
    setIsLogOpen(true);
  };

  const showTierSelect = metadata.tierCount > 0 && !metadata.noTierRanks.includes(logData.rank);

  if (!game) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-slate-300 hover:text-white -ml-4 hover-highlight">
              <ChevronLeft className="mr-2" size={20} />
              Back to Dashboard
            </Button>
          </Link>
          <Dialog open={isLogOpen} onOpenChange={(v) => { setIsLogOpen(v); if(!v) setEditingLogId(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-600/20">
                <Plus size={16} className="mr-2" /> LOG RANK CHANGE
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-white">
              <DialogHeader><DialogTitle className="italic uppercase font-black">{editingLogId ? 'EDIT COMBAT LOG' : 'LOG COMBAT DATA'}</DialogTitle></DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-300">
                    {isFaceit ? 'Faceit ELO' : isOsu ? 'Global Rank' : 'Rank / Rating'}
                  </Label>
                  {metadata.ranks.length > 0 ? (
                    <Select onValueChange={(v) => setLogData({...logData, rank: v})} value={logData.rank}>
                      <SelectTrigger className="bg-slate-900 border-slate-800"><SelectValue placeholder="Select Rank" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {metadata.ranks.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      placeholder={isFaceit ? "Enter ELO (e.g. 1250)" : isOsu ? "e.g. 50000" : "Enter Rating"} 
                      value={logData.rank} 
                      onChange={(e) => isFaceit ? handleEloChange(e.target.value) : setLogData({...logData, rank: e.target.value})}
                      className="bg-slate-900 border-slate-800"
                    />
                  )}
                </div>
                
                {isFaceit && (
                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-300">Faceit Level</Label>
                    <Select 
                      onValueChange={(v) => setLogData({...logData, tier: `Level ${v}`})} 
                      value={logData.tier.replace('Level ', '')}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-800"><SelectValue placeholder="Select Level" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {FACEIT_LEVELS.map(lvl => <SelectItem key={lvl} value={lvl}>Level {lvl}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {showTierSelect && !isFaceit && (
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-300">Tier</Label>
                    <Select 
                      onValueChange={(v) => setLogData({...logData, tier: v})} 
                      value={logData.tier}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-800"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {Array.from({ length: metadata.tierCount }, (_, i) => (i + 1).toString()).map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-300">Log Date</Label>
                  <Input type="datetime-local" value={logData.timestamp} onChange={(e) => setLogData({...logData, timestamp: e.target.value})} className="bg-slate-900 border-slate-800" />
                </div>
              </div>
              <DialogFooter><Button onClick={handleLogRank} className="w-full bg-indigo-600 font-black uppercase py-6">{editingLogId ? 'Update Entry' : 'Confirm Log'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative h-64 rounded-3xl overflow-hidden border border-slate-800 mb-10">
          {game.image ? <img src={game.image} alt={game.title} className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full bg-slate-900" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-4">{game.title}</h1>
              <Tabs value={activeMode} onValueChange={setActiveMode}>
                <TabsList className="bg-slate-950/50 border border-slate-800 p-1 h-auto">
                  {game.modes.map((m: any) => (
                    <TabsTrigger key={m.name} value={m.name} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                      {m.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <RankBadge rank={currentModeData?.rank} tier={currentModeData?.tier} gameTitle={game.title} className="scale-110" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <ProgressChart data={[]} rankNames={metadata.ranks} />

            <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 bg-slate-900/80">
                <CardTitle className="text-sm font-black italic uppercase tracking-widest flex items-center gap-2">
                  <TableIcon className="text-indigo-500" size={16} />
                  COMBAT LOGS (SHEET VIEW)
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase text-slate-400" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
                  Date {sortOrder === 'desc' ? <ArrowDown size={10} /> : <ArrowUp size={10} />}
                </Button>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800">
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-800">Date / Time</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-800">Rank / Rating</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHistory.length > 0 ? sortedHistory.map((h: any, idx) => (
                      <tr key={h.id} className={cn("border-b border-slate-800/50 hover-highlight transition-colors", idx % 2 === 0 ? "bg-slate-900/20" : "bg-transparent")}>
                        <td className="px-6 py-4 text-xs font-mono text-slate-300 border-r border-slate-800/50">{new Date(h.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 border-r border-slate-800/50">
                          <div className="flex items-center gap-3">
                            <RankBadge rank={h.rank} tier={h.tier} gameTitle={game.title} className="scale-90" />
                            <span className="text-xs font-black text-white uppercase">
                              {isOsu ? `#${Number(h.rank).toLocaleString()}` : `${h.rank} ${h.tier}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {h.id === peakId && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black text-yellow-500 uppercase">
                                <Trophy size={10} /> Peak
                              </span>
                            )}
                            {h.id === currentId && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase">
                                <Target size={10} /> Current
                              </span>
                            )}
                            {h.id !== currentId && h.id !== peakId && (
                              <span className="px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Log</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-white"
                            onClick={() => openEditDialog(h)}
                          >
                            <Edit2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No combat data logged.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader><CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">External Trackers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {externalLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all group hover-highlight">
                    <span className="text-xs font-bold text-white uppercase">{link.name}</span>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-400" />
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10"><MadeWithDyad /></footer>
      </main>
    </div>
  );
};

export default GameDetail;