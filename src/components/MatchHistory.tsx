"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Swords } from 'lucide-react';

interface Match {
  id: number;
  game: string;
  result: string;
  change: string;
  map: string;
  score: string;
  date: string;
}

const MatchHistory = ({ matches = [] }: { matches?: Match[] }) => {
  return (
    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Recent Matches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full ${
                  match.result === 'Win' ? 'bg-emerald-500' : 
                  match.result === 'Loss' ? 'bg-red-500' : 'bg-slate-500'
                }`} />
                <div>
                  <p className="font-bold text-white">{match.result} • {match.map}</p>
                  <p className="text-xs text-slate-300">{match.score} • {match.date}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 font-mono font-bold ${
                  match.result === 'Win' ? 'text-emerald-400' : 
                  match.result === 'Loss' ? 'text-red-400' : 'text-slate-300'
                }`}>
                  {match.result === 'Win' ? <TrendingUp size={14} /> : 
                   match.result === 'Loss' ? <TrendingDown size={14} /> : <Minus size={14} />}
                  {match.change}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">{match.game}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Swords size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No combat data logged</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchHistory;