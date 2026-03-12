"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { History as HistoryIcon, Filter, Search, Download, Calendar, Swords, Activity, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from '@/components/AppLayout';
import RankBadge from '@/components/RankBadge';
import { cn } from '@/lib/utils';

const History = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'rank' | 'match'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const allLogs: any[] = [];

    savedGames.forEach((game: any) => {
      game.modes.forEach((mode: any) => {
        (mode.history || []).forEach((entry: any) => {
          allLogs.push({
            ...entry,
            gameTitle: game.title,
            modeName: mode.name,
            // If entry.type exists (from AddMatchModal), use it, otherwise it's a rank update
            logType: entry.type || 'rank' 
          });
        });
      });
    });

    setLogs(allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesFilter = filter === 'all' || 
        (filter === 'rank' && log.logType === 'rank') || 
        (filter === 'match' && log.logType === 'detailed');
      
      const matchesSearch = !search || 
        log.gameTitle.toLowerCase().includes(search.toLowerCase()) ||
        log.modeName.toLowerCase().includes(search.toLowerCase()) ||
        (log.map && log.map.toLowerCase().includes(search.toLowerCase())) ||
        (log.rank && log.rank.toLowerCase().includes(search.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [logs, filter, search]);

  const exportHistory = () => {
    let csvContent = "Date,Game,Mode,Type,Result,Rank,Map,Stats\n";
    filteredLogs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleString();
      const stats = log.stats ? JSON.stringify(log.stats).replace(/"/g, '""') : "";
      csvContent += `"${date}","${log.gameTitle}","${log.modeName}","${log.logType}","${log.result || ''}","${log.rank} ${log.tier || ''}","${log.map || ''}","${stats}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gtracker_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">History Archive</h1>
            <p className="text-slate-400 font-medium">Comprehensive record of all rank updates and match logs.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportHistory} className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-white">
              <Download className="mr-2" size={18} />
              Export View
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <Input 
              placeholder="Search by game, map, or rank..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border-slate-800 pl-10 h-12 focus:ring-blue-500 text-white"
            />
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-full md:w-48 bg-slate-900 border-slate-800 h-12 text-white">
              <Filter className="mr-2" size={18} />
              <SelectValue placeholder="Filter Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="all">All Updates</SelectItem>
              <SelectItem value="rank">Rank Changes</SelectItem>
              <SelectItem value="match">Match Logs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredLogs.length > 0 ? filteredLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  log.logType === 'detailed' ? "bg-indigo-600/20 text-indigo-400" : "bg-emerald-600/20 text-emerald-400"
                )}>
                  {log.logType === 'detailed' ? <Swords size={20} /> : <Activity size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{log.gameTitle}</h3>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">• {log.modeName}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {new Date(log.timestamp).toLocaleString()}
                    {log.map && <span className="text-indigo-400 ml-2">@ {log.map}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 justify-between sm:justify-end">
                {log.logType === 'detailed' && (
                  <div className="text-right">
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                      log.result === 'win' ? "bg-emerald-500/20 text-emerald-400" : 
                      log.result === 'loss' ? "bg-red-500/20 text-red-400" : "bg-slate-500/20 text-slate-400"
                    )}>
                      {log.result || 'Logged'}
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-end">
                  <RankBadge rank={log.rank} tier={log.tier} gameTitle={log.gameTitle} className="scale-90 origin-right" />
                </div>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/20">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto mb-6 text-slate-700">
                <HistoryIcon size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-300 mb-2">No History Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">Adjust your filters or start logging your progress to see data here.</p>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default History;