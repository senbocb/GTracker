"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Timer, TrendingUp, Swords } from 'lucide-react';

const SessionTracker = () => {
  return (
    <Card className="bg-slate-900/80 border-blue-500/30 backdrop-blur-md overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-400">
            <Timer size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Session</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">02:45:12</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Matches</p>
            <div className="flex items-center gap-1.5">
              <Swords size={14} className="text-slate-400" />
              <p className="text-lg font-black text-white">5</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase">W / L</p>
            <p className="text-lg font-black text-emerald-400">4 <span className="text-slate-600">/</span> 1</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Net RR</p>
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingUp size={14} />
              <p className="text-lg font-black">+64</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionTracker;