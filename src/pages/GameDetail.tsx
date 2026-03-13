"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, History, Plus, Trophy, ExternalLink, ArrowUp, ArrowDown, Table as TableIcon, Target, Activity, Edit2, Calendar, BarChart3, Map as MapIcon } from 'lucide-react';
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
import CS2MapRanks from '@/components/CS2MapRanks';
import BenchmarkManager from '@/components/BenchmarkManager';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const CS_LEGACY_RANKS = [
  "Silver I", "Silver II", "Silver III", "Silver IV", "Silver Elite", "Silver Elite Master",
  "Gold Nova I", "Gold Nova II", "Gold Nova III", "Gold Nova Master",
  "Master Guardian I", "Master Guardian II", "Master Guardian Elite", "Distinguished Master Guardian",
  "Legendary Eagle", "Legendary Eagle Master", "Supreme Master First Class", "The Global Elite"
];

const CS2_MAPS = ["Mirage", "Inferno", "Dust II", "Nuke", "Vertigo", "Ancient", "Anubis", "Overpass"];

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
  },
  "Rainbow Six Siege": {
    ranks: ["Copper", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Champion"],
    tierCount: 5,
    tierDirection: 'desc',
    noTierRanks: ["Champion"]
  },
  "The Finals": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ruby"],
    tierCount: 4,
    tierDirection: 'desc',
    noTierRanks: ["Ruby"]
  },
  "Marvel Rivals": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Grandmaster", "Celestial", "Eternity"],
    tierCount: 3,
    tierDirection: 'desc',
    noTierRanks: ["Eternity"]
  },
  "Aim Lab": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"],
    tierCount: 0,
    tierDirection: 'asc',
    noTierRanks: []
  },
  "Kovaaks": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Nova", "Astra", "Celestial"],
    tierCount: 0,
    tierDirection: 'asc',
    noTierRanks: []
  }
};

const OW2_ROLE_ORDER = ["Tank", "Damage", "Support"];

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [activeMode, setActiveMode] = useState('');
  const [externalLinks, setExternalLinks] = useState<any[]>([]);
  const [linkedSocials, setLinkedSocials] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [logData, setLogData] = useState({
    rank: '',
    tier: '',
    map: '',
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
      setSeasons(found.seasons || []);

      const savedSocials = JSON.parse(localStorage.getItem('combat_socials') || '[]');
      const linked = savedSocials.filter((s: any) => s.category === 'stat_trackers' && s.gameId === id);
      setLinkedSocials(linked);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const currentModeData = useMemo(() => {
    return game?.modes.find((m: any) => m.name === activeMode);
  }, [game, activeMode]);

  const metadata = useMemo(() => {
    const base = GAME_METADATA[game?.title] || { ranks: [], tierCount: 0, tierDirection: 'asc', noTierRanks: [] };
    if (game?.title === 'Counter-Strike 2' && (activeMode === 'Wingman' || activeMode === 'Per-Map Rank')) {
      return { ...base, ranks: CS_LEGACY_RANKS };
    }
    return base;
  }, [game, activeMode]);

  const getRankValue = (rankName: string, tierName?: string) => {
    if (!rankName) return 0;
    const numeric = parseInt(rankName.replace(/\D/g, ''));
    if (game?.title === 'osu!') return 10000000 - numeric;
    if (game?.title === 'Counter-Strike 2' && activeMode === 'Premier') return numeric;
    if (game?.title === 'Counter-Strike 2' && (activeMode === 'Wingman' || activeMode === 'Per-Map Rank')) {
      return CS_LEGACY_RANKS.indexOf(rankName) + 1;
    }
    if (!isNaN(numeric) && !metadata.ranks.includes(rankName)) return numeric;
    const rankIdx = metadata.ranks.indexOf(rankName);
    if (rankIdx === -1) return 0;
    const tierValue = tierName ? parseInt(tierName.replace(/\D/g, '')) || 0 : 0;
    const baseValue = (rankIdx + 1) * 100;
    if (metadata.noTierRanks.includes(rankName) || metadata.tierCount === 0) return baseValue;
    return metadata.tierDirection === 'asc' ? baseValue + tierValue : baseValue + (metadata.tierCount - tierValue + 1);
  };

  const { sortedHistory, currentId, peakId } = useMemo(() => {
    if (!currentModeData?.history || currentModeData.history.length === 0) {
      return { sortedHistory: [], currentId: null, peakId: null };
    }
    const history = [...currentModeData.history];
    const current = history.reduce((prev, curr) => new Date(curr.timestamp) > new Date(prev.timestamp) ? curr : prev);
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

  const handleLogRank = () => {
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
            history[logIdx] = { ...history[logIdx], rank: logData.rank, tier: logData.tier, map: logData.map, timestamp: new Date(logData.timestamp).toISOString() };
          }
        } else {
          history.unshift({ id: Date.now().toString(), rank: logData.rank, tier: logData.tier, map: logData.map, timestamp: new Date(logData.timestamp).toISOString() });
        }
        const newest = history.reduce((prev, curr) => new Date(curr.timestamp) > new Date(prev.timestamp) ? curr : prev);
        const peak = history.reduce((prev, curr) => {
          const valPrev = getRankValue(prev.rank, prev.tier);
          const valCurr = getRankValue(curr.rank, curr.tier);
          return valCurr > valPrev ? curr : prev;
        });
        newModes[modeIdx] = { ...g.modes[modeIdx], rank: newest.rank, tier: newest.tier, peakRank: `${peak.rank} ${peak.tier || ''}`.trim(), history: history };
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

  if (!game) return null;
  const activeBanner = currentModeData?.image || game.image;
  const allTrackers = [...externalLinks, ...linkedSocials.map(s => ({ name: s.name, url: s.url, icon: s.icon, isLinked: true }))];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/"><Button variant="ghost" className="text-slate-300 hover:text-white -ml-4 hover-highlight"><ChevronLeft className="mr-2" size={20} /> Back to Dashboard</Button></Link>
          <Dialog open={isLogOpen} onOpenChange={(v) => { setIsLogOpen(v); if(!v) setEditingLogId(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-600/20"><Plus size={16} className="mr-2" /> Log Rank Change</Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-white">
              <DialogHeader><DialogTitle className="italic uppercase font-black">{editingLogId ? 'Edit History Entry' : 'Log Rank Change'}</DialogTitle></DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-300">Rank / Rating</Label>
                  {metadata.ranks.length > 0 ? (
                    <Select onValueChange={(v) => setLogData({...logData, rank: v})} value={logData.rank}>
                      <SelectTrigger className="bg-slate-900 border-slate-800"><SelectValue placeholder="Select Rank" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {metadata.ranks.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input placeholder="Enter Rating" value={logData.rank} onChange={(e) => setLogData({...logData, rank: e.target.value})} className="bg-slate-900 border-slate-800" />
                  )}
                </div>
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
          {activeBanner ? <img src={activeBanner} alt={game.title} className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full bg-slate-900" />}
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
            {(game.title === 'Kovaaks' || game.title === 'Aim Lab') && <BenchmarkManager gameId={game.id} />}
            
            <ProgressChart history={currentModeData?.history} rankNames={metadata.ranks} getRankValue={getRankValue} />

            <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 bg-slate-900/80">
                <CardTitle className="text-sm font-black italic uppercase tracking-widest flex items-center gap-2"><TableIcon className="text-indigo-500" size={16} /> Match History</CardTitle>
                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase text-slate-400" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>Date {sortOrder === 'desc' ? <ArrowDown size={10} /> : <ArrowUp size={10} />}</Button>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800">
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-800">Date / Time</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-800">Rank / Rating</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHistory.length > 0 ? sortedHistory.map((h: any, idx) => (
                      <tr key={h.id} className={cn("border-b border-slate-800/50 hover-highlight transition-colors", idx % 2 === 0 ? "bg-slate-900/20" : "bg-transparent")}>
                        <td className="px-6 py-4 text-xs font-mono text-slate-300 border-r border-slate-800/50">{new Date(h.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 border-r border-slate-800/50">
                          <div className="flex items-center gap-3">
                            <RankBadge rank={h.rank} tier={h.tier} gameTitle={game.title} className="scale-90" />
                            <span className="text-xs font-black text-white uppercase">{h.rank} {h.tier}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {h.id === peakId && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black text-yellow-500 uppercase"><Trophy size={10} /> Peak</span>}
                            {h.id === currentId && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase"><Target size={10} /> Current</span>}
                          </div>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No data logged.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <SeasonManager gameId={game.id} seasons={seasons} onUpdate={(s) => setSeasons(s)} />
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader><CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={16} className="text-indigo-500" /> External Trackers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {allTrackers.length > 0 ? allTrackers.map((link: any, i) => (
                  <a key={i} href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all group hover-highlight">
                    <div className="flex items-center gap-3">
                      {link.icon ? <img src={link.icon} alt="" className="w-5 h-5 object-contain rounded" /> : <ExternalLink size={14} className="text-slate-500" />}
                      <div className="flex flex-col"><span className="text-xs font-bold text-white uppercase">{link.name}</span>{link.isLinked && <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">Linked Profile</span>}</div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-400" />
                  </a>
                )) : <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center py-4">No trackers linked.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameDetail;