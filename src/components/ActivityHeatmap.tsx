"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const ActivityHeatmap = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  }, []);

  const weeks = useMemo(() => {
    const result = [];
    const start = new Date(selectedYear, 0, 1);
    start.setDate(start.getDate() - start.getDay());

    let current = new Date(start);

    // Strictly 53 weeks to ensure full year coverage and better fill
    for (let w = 0; w < 53; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split('T')[0];
        const count = data[dateStr] || 0;
        const isCurrentYear = current.getFullYear() === selectedYear;
        
        week.push({ 
          date: dateStr, 
          count, 
          isCurrentYear,
          isFuture: current > new Date()
        });
        current.setDate(current.getDate() + 1);
      }
      result.push(week);
    }
    return result;
  }, [data, selectedYear]);

  const getColor = (day: any) => {
    if (!day.isCurrentYear) return 'bg-slate-950/20 border-transparent opacity-10';
    if (day.isFuture) return 'bg-transparent border-transparent opacity-0';
    if (day.count === 0) return 'bg-slate-900/40 border-slate-800/30';
    if (day.count <= 2) return 'bg-indigo-900/60 border-indigo-800/20';
    if (day.count <= 5) return 'bg-indigo-700/80 border-indigo-600/30';
    return 'bg-indigo-500 border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.4)]';
  };

  return (
    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-slate-800/50 bg-slate-900/50 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Activity size={14} className="text-indigo-500" />
            Operational Frequency
          </CardTitle>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-24 h-7 bg-slate-950 border-slate-800 text-[10px] font-black uppercase text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-white">
              {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1.5 sm:gap-2">
          <TooltipProvider delayDuration={0}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1.5 sm:gap-2">
                {week.map((day, di) => (
                  <Tooltip key={di}>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "aspect-square w-full rounded-[3px] border transition-all hover:scale-150 hover:z-10 cursor-crosshair",
                          getColor(day)
                        )} 
                        style={{ minWidth: '6px' }}
                      />
                    </TooltipTrigger>
                    {!day.isFuture && day.isCurrentYear && (
                      <TooltipContent 
                        side="top" 
                        className="bg-slate-950 border-slate-800 text-[10px] font-bold uppercase tracking-widest p-2 z-[100]"
                        collisionPadding={10}
                      >
                        <p className="text-white">{day.count} Changes</p>
                        <p className="text-slate-500">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            ))}
          </TooltipProvider>
        </div>
        
        <div className="mt-8 flex items-center justify-between border-t border-slate-800/30 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm ring-1 ring-indigo-500/50 ring-offset-2 ring-offset-slate-950 bg-indigo-500/20" />
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Cycle</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Less</span>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-slate-900/40 border border-slate-800/30" />
              <div className="w-3 h-3 rounded-sm bg-indigo-900/60 border-indigo-800/20" />
              <div className="w-3 h-3 rounded-sm bg-indigo-700/80 border-indigo-600/30" />
              <div className="w-3 h-3 rounded-sm bg-indigo-500 border border-indigo-400/50 shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
            </div>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;