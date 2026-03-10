"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const matches = [
  { id: 1, game: 'Valorant', result: 'Win', change: '+22 RR', map: 'Ascent', score: '13-8', date: '2h ago' },
  { id: 2, game: 'Valorant', result: 'Loss', change: '-18 RR', map: 'Haven', score: '10-13', date: '5h ago' },
  { id: 3, game: 'Valorant', result: 'Win', change: '+15 RR', map: 'Bind', score: '13-11', date: 'Yesterday' },
  { id: 4, game: 'Valorant', result: 'Draw', change: '0 RR', map: 'Icebox', score: '14-14', date: 'Yesterday' },
];

const MatchHistory = () => {
  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Recent Matches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-10 rounded-full ${
                match.result === 'Win' ? 'bg-emerald-500' : 
                match.result === 'Loss' ? 'bg-red-500' : 'bg-slate-500'
              }`} />
              <div>
                <p className="font-bold text-white">{match.result} • {match.map}</p>
                <p className="text-xs text-slate-400">{match.score} • {match.date}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 font-mono font-bold ${
                match.result === 'Win' ? 'text-emerald-400' : 
                match.result === 'Loss' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {match.result === 'Win' ? <TrendingUp size={14} /> : 
                 match.result === 'Loss' ? <TrendingDown size={14} /> : <Minus size={14} />}
                {match.change}
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{match.game}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MatchHistory;