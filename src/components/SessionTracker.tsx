"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Swords, Activity, Target, ChevronRight } from 'lucide-react';

const SessionTracker = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedGame, setSelectedGame] = useState('all');
  const [games, setGames] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState({ matches: 0, wins: 0, losses: 0, netRR: 0, netPoints: 0 });

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    setGames(savedGames);

    const sessionStart = localStorage.getItem('combat_session_start');
    if (sessionStart) {
      const startTime = parseInt(sessionStart);
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
      setIsActive(true);
    } else {
      localStorage.setItem('combat_session_start', Date.now().toString());
      setIsActive(true);
    }

    const savedStats = JSON.parse(localStorage.getItem('combat_session_stats') || '{"matches":0,"wins":0,"losses":0,"netRR":0,"netPoints":0}');
    setSessionStats(savedStats);

    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

  const getMetricLabel = () => {
    if (selectedGame === 'all') return 'Net RR';
    const game = games.find(g => g.id === selectedGame);
    if (game?.title === 'Valorant') return 'Net RR';
    if (game?.title === 'League of Legends') return 'Net LP';
    if (game?.title === 'Counter-Strike 2') return 'Rating Change';
    return 'Rank Points';
  };

  return (
    <Card className="bg-slate-900/95 border-blue-500/30 backdrop-blur-md overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-1.5 transition-all" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-blue-400">
            <Activity size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Session</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 font-mono">
            {formatTime(seconds)}
          </span>
        </div>

        <div className="mb-6">
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="bg-slate-950 border-slate-800 h-8 text-[10px] font-bold uppercase">
              <SelectValue placeholder="Filter by Game" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="all">All Operations</SelectItem>
              {games.map(g => (
                <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Matches</p>
            <div className="flex items-center gap-1.5">
              <Swords size={14} className="text-slate-400" />
              <p className="text-xl font-black text-white">{sessionStats.matches}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">W / L</p>
            <p className="text-xl font-black text-white">
              {sessionStats.wins} <span className="text-slate-800">/</span> {sessionStats.losses}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{getMetricLabel()}</p>
            <div className={`flex items-center gap-1 ${sessionStats.netRR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp size={14} />
              <p className="text-xl font-black">{sessionStats.netRR > 0 ? `+${sessionStats.netRR}` : sessionStats.netRR}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target size={12} className="text-blue-500" />
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Session Goal: +50 RR</p>
          </div>
          <ChevronRight size={12} className="text-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionTracker;