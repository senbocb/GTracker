"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const ActivityHeatmap = () => {
  const data = useMemo(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const activityMap: Record<string, number> = {};
    
    savedGames.forEach((game: any) => {
      game.modes.forEach((mode: any) => {
        (mode.history || []).forEach((log: any) => {
          const date = new Date(log.timestamp).toISOString().split('T')[0];
          activityMap[date] = (activityMap[date] || 0) + 1;
        });
      });
    });
    return activityMap;
  }, []);

  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    // Show last 24 weeks (approx 6 months)
    for (let i = 167; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = data[dateStr] || 0;
      result.push({ date: dateStr, count });
    }
    return result;
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-900/50 border-slate-800/50';
    if (count <= 2) return 'bg-indigo-900/60 border-indigo-800/30';
    if (count <= 5) return 'bg-indigo-700/80 border-indigo-600/30';
    return 'bg-indigo-500 border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]';
  };

  return (
    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <Activity size={14} className="text-indigo-500" />
          Operational Frequency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          <TooltipProvider delayDuration={0}>
            {days.map((day, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "w-3 h-3 rounded-sm border transition-all hover:scale-125 cursor-crosshair",
                      getColor(day.count)
                    )} 
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-slate-950 border-slate-800 text-[10px] font-bold uppercase tracking-widest">
                  {day.count} Changes on {new Date(day.date).toLocaleDateString()}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm bg-slate-900 border border-slate-800" />
            <div className="w-2 h-2 rounded-sm bg-indigo-900 border border-indigo-800" />
            <div className="w-2 h-2 rounded-sm bg-indigo-700 border border-indigo-600" />
            <div className="w-2 h-2 rounded-sm bg-indigo-500 border border-indigo-400" />
          </div>
          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">More</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;