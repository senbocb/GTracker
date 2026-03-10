"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Timer, TrendingUp, Swords, Activity } from 'lucide-react';

const SessionTracker = () => {
  return (
    <Card className="bg-slate-900/80 border-blue-500/30 backdrop-blur-md overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-1.5 transition-all" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-blue-400">
            <div className="relative">
              <Activity size={16} className="animate-pulse" />
              <div className="absolute inset-0 bg-blue-400 blur-sm opacity-50 animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Live Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 font-mono">00:00:00</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Matches</p>
            <div className="flex items-center gap-1.5">
              <Swords size={14} className="text-slate-400" />
              <p className="text-xl font-black text-white">0</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">W / L</p>
            <p className="text-xl font-black text-slate-700">0 <span className="text-slate-800">/</span> 0</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Net RR</p>
            <div className="flex items-center gap-1 text-slate-700">
              <TrendingUp size={14} />
              <p className="text-xl font-black">0</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/50">
          <div className="flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Session Status</p>
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Standby</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionTracker;