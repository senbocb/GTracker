"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, Swords, Target } from 'lucide-react';

const SessionTracker = () => {
  const [seconds, setSeconds] = useState(0);
  const [sessionStats] = useState({ matches: 0, wins: 0, losses: 0, netRR: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

  return (
    <Card className="bg-slate-900/40 border-slate-800/50 rounded-2xl saas-shadow overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Clock size={16} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Session Time</span>
          </div>
          <span className="text-sm font-mono font-bold text-white bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            {formatTime(seconds)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Matches</p>
            <div className="flex items-center gap-2">
              <Swords size={14} className="text-slate-400" />
              <span className="text-xl font-bold text-white">{sessionStats.matches}</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Net RR</p>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xl font-bold text-emerald-400">+{sessionStats.netRR}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center gap-2">
          <Target size={14} className="text-indigo-500" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Goal: +50 RR</p>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-2">
            <div className="h-full bg-indigo-500 w-1/3 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionTracker;