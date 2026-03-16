"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Plus, Trash2, Calendar, Trophy, Award, Loader2 } from 'lucide-react';
import RankBadge from './RankBadge';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface BenchmarkLog {
  id: string;
  name: string;
  rank: string;
  date: string;
}

interface KovaaksBenchmarksProps {
  gameId: string;
}

const KovaaksBenchmarks = ({ gameId }: KovaaksBenchmarksProps) => {
  const [logs, setLogs] = useState<BenchmarkLog[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLog, setNewLog] = useState({ name: '', rank: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    const saved = localStorage.getItem(`kovaaks_manual_logs_${gameId}`);
    if (saved) setLogs(JSON.parse(saved));
  }, [gameId]);

  const saveLogs = (updated: BenchmarkLog[]) => {
    setLogs(updated);
    localStorage.setItem(`kovaaks_manual_logs_${gameId}`, JSON.stringify(updated));
  };

  const handleAddLog = () => {
    if (!newLog.name || !newLog.rank) return;
    
    const log: BenchmarkLog = {
      id: Date.now().toString(),
      ...newLog
    };
    
    const updated = [log, ...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    saveLogs(updated);
    setNewLog({ name: '', rank: '', date: new Date().toISOString().split('T')[0] });
    setIsAddOpen(false);
    showSuccess("Benchmark record archived.");
  };

  const removeLog = (id: string) => {
    saveLogs(logs.filter(l => l.id !== id));
    showSuccess("Record removed.");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-slate-800 bg-slate-900/50 text-indigo-400 hover:text-white hover:bg-indigo-600/10 h-12 rounded-xl font-black uppercase tracking-widest">
          <Target className="mr-2" size={18} />
          Manual Benchmarks
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[600px] p-0 overflow-hidden flex flex-col h-[70vh]">
        <div className="bg-slate-900 p-6 border-b border-slate-800 shrink-0 flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
              <Trophy className="text-yellow-500" />
              Benchmark Archive
            </DialogTitle>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Manual entry for tactical aim progression</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 h-10 text-[10px] font-black uppercase">
            <Plus size={16} className="mr-2" /> Log Entry
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {logs.length > 0 ? logs.map((log) => (
            <div key={log.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-indigo-500">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{log.name}</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> {new Date(log.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <RankBadge rank={log.rank} gameTitle="Kovaaks" className="scale-90 origin-right" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeLog(log.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
              <Target size={32} className="mx-auto text-slate-700 mb-4" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No benchmark records found</p>
            </div>
          )}
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white">
            <DialogHeader><DialogTitle className="italic uppercase font-black">Log Benchmark</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Benchmark Name</Label>
                <Input placeholder="e.g. Voltaic S4 Advanced" value={newLog.name} onChange={(e) => setNewLog({...newLog, name: e.target.value})} className="bg-slate-900 border-slate-800" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Total Rank Achieved</Label>
                <Input placeholder="e.g. Diamond Complete" value={newLog.rank} onChange={(e) => setNewLog({...newLog, rank: e.target.value})} className="bg-slate-900 border-slate-800" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Date</Label>
                <Input type="date" value={newLog.date} onChange={(e) => setNewLog({...newLog, date: e.target.value})} className="bg-slate-900 border-slate-800" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddLog} className="w-full bg-indigo-600 font-black uppercase py-6">Archive Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default KovaaksBenchmarks;