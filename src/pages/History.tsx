"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { History as HistoryIcon, Filter, Search, Download, Calendar, Swords, Activity, Target, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AppLayout from '@/components/AppLayout';
import RankBadge from '@/components/RankBadge';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { showSuccess, showError } from '@/utils/toast';
import { useRegistry } from '@/components/RegistryProvider';

const History = () => {
  const { user } = useAuth();
  const { registry } = useRegistry();
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'rank' | 'match'>('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [editingLog, setEditingLog] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('game_history')
      .select('*, game_modes(name, games(title))')
      .order('timestamp', { ascending: false });
    
    if (data) {
      const formatted = data.map(log => ({
        ...log,
        gameTitle: log.game_modes?.games?.title,
        modeName: log.game_modes?.name,
        logType: log.result ? 'match' : 'rank'
      }));
      setLogs(formatted);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    const { error } = await supabase.from('game_history').delete().eq('id', id);
    if (error) showError(error.message);
    else {
      showSuccess("Log removed.");
      fetchLogs();
    }
  };

  const handleUpdate = async () => {
    if (!editingLog) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('game_history')
        .update({
          rank: editingLog.rank,
          tier: editingLog.tier,
          map: editingLog.map,
          result: editingLog.result,
          timestamp: new Date(editingLog.timestamp).toISOString() // Convert local back to UTC
        })
        .eq('id', editingLog.id);
      
      if (error) throw error;
      showSuccess("Log updated.");
      setEditingLog(null);
      fetchLogs();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesType = filter === 'all' || log.logType === filter;
      const matchesGame = gameFilter === 'all' || log.gameTitle === gameFilter;
      const matchesSearch = !search || 
        log.gameTitle.toLowerCase().includes(search.toLowerCase()) ||
        log.modeName.toLowerCase().includes(search.toLowerCase()) ||
        (log.map && log.map.toLowerCase().includes(search.toLowerCase()));

      return matchesType && matchesGame && matchesSearch;
    });
  }, [logs, filter, gameFilter, search]);

  const uniqueGames = useMemo(() => Array.from(new Set(logs.map(l => l.gameTitle))), [logs]);

  const getAvailableRanks = (gameTitle: string, modeName: string) => {
    const gameData = registry.find(g => g.title === gameTitle);
    if (!gameData) return [];
    const modeData = gameData.modes?.find((m: any) => m.name === modeName);
    return modeData?.ranks || [];
  };

  // Helper to convert UTC to local ISO string for input
  const toLocalISO = (utcString: string) => {
    const date = new Date(utcString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">History Archive</h1>
            <p className="text-slate-400 font-medium">Comprehensive record of all rank updates and match logs.</p>
          </div>
          <Button variant="outline" onClick={() => {}} className="border-slate-800 bg-slate-900/50 text-white">
            <Download className="mr-2" size={18} /> Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <Input 
              placeholder="Search by game, map, or rank..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border-slate-800 pl-10 h-12 text-white"
            />
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="bg-slate-900 border-slate-800 h-12 text-white">
              <Filter className="mr-2" size={18} />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-white">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="rank">Rank Changes</SelectItem>
              <SelectItem value="match">Match Logs</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="bg-slate-900 border-slate-800 h-12 text-white">
              <Target className="mr-2" size={18} />
              <SelectValue placeholder="Game" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-white">
              <SelectItem value="all">All Games</SelectItem>
              {uniqueGames.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
          ) : filteredLogs.length > 0 ? filteredLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  log.logType === 'match' ? "bg-indigo-600/20 text-indigo-400" : "bg-emerald-600/20 text-emerald-400"
                )}>
                  {log.logType === 'match' ? <Swords size={20} /> : <Activity size={20} />}
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

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <RankBadge rank={log.rank} tier={log.tier} gameTitle={log.gameTitle} className="scale-90 origin-right" />
                  {log.result && (
                    <span className={cn(
                      "text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-1",
                      log.result === 'win' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    )}>{log.result}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => setEditingLog({ ...log, timestamp: toLocalISO(log.timestamp) })} className="h-8 w-8 text-slate-500 hover:text-white"><Edit2 size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(log.id)} className="h-8 w-8 text-slate-500 hover:text-red-400"><Trash2 size={14} /></Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/20">
              <p className="text-slate-500 max-w-xs mx-auto text-sm">No history found matching your criteria.</p>
            </div>
          )}
        </div>

        {editingLog && (
          <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
            <DialogContent className="bg-slate-950 border-slate-800 text-white">
              <DialogHeader><DialogTitle className="italic uppercase font-black">Edit Log Entry</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Rank</Label>
                  <Select 
                    value={editingLog.rank} 
                    onValueChange={(v) => setEditingLog({...editingLog, rank: v})}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue placeholder="Select Rank" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {getAvailableRanks(editingLog.gameTitle, editingLog.modeName).map((r: string) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Tier</Label>
                  <Input value={editingLog.tier || ''} onChange={(e) => setEditingLog({...editingLog, tier: e.target.value})} className="bg-slate-900 border-slate-800" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Map</Label>
                  <Input value={editingLog.map || ''} onChange={(e) => setEditingLog({...editingLog, map: e.target.value})} className="bg-slate-900 border-slate-800" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Timestamp</Label>
                  <Input type="datetime-local" value={editingLog.timestamp} onChange={(e) => setEditingLog({...editingLog, timestamp: e.target.value})} className="bg-slate-900 border-slate-800" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdate} disabled={isSubmitting} className="w-full bg-indigo-600 font-black uppercase py-6">
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </AppLayout>
  );
};

export default History;