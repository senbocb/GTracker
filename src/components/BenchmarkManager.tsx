"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Target, Check, Filter, ExternalLink, Trophy } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Benchmark {
  id: string;
  name: string;
  rank: string;
  category: 'Tracking' | 'Clicking' | 'Switching' | 'Overall';
  verified: boolean;
  visible: boolean;
}

const MOCK_BENCHMARKS: Benchmark[] = [
  { id: '1', name: 'Voltaic Novice', rank: 'Gold', category: 'Overall', verified: true, visible: true },
  { id: '2', name: 'Tracking Fundamentals', rank: 'Platinum', category: 'Tracking', verified: true, visible: true },
  { id: '3', name: 'Static Clicking', rank: 'Diamond', category: 'Clicking', verified: true, visible: true },
  { id: '4', name: 'Target Switching', rank: 'Gold', category: 'Switching', verified: true, visible: false },
];

const BenchmarkManager = ({ gameId }: { gameId: string }) => {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [evxlUrl, setEvxlUrl] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`benchmarks_${gameId}`) || '[]');
    if (saved.length > 0) setBenchmarks(saved);
    else setBenchmarks(MOCK_BENCHMARKS);
  }, [gameId]);

  const handleSync = () => {
    if (!evxlUrl.includes('evxl.app')) {
      showError("Please provide a valid EVXL profile URL.");
      return;
    }
    setIsSyncing(true);
    // Simulate scraping/API call
    setTimeout(() => {
      setIsSyncing(false);
      showSuccess("Benchmarks synced from EVXL.");
      setBenchmarks(MOCK_BENCHMARKS.map(b => ({ ...b, verified: true })));
    }, 2000);
  };

  const toggleVisibility = (id: string) => {
    const updated = benchmarks.map(b => b.id === id ? { ...b, visible: !b.visible } : b);
    setBenchmarks(updated);
    localStorage.setItem(`benchmarks_${gameId}`, JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Target className="text-indigo-500" size={16} />
            EVXL Benchmark Sync
          </CardTitle>
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase text-slate-400">
                <Filter size={12} className="mr-2" /> Filter Display
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="italic uppercase font-black">Benchmark Visibility</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {benchmarks.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase">{b.name}</span>
                      <span className="text-[8px] font-black text-slate-500 uppercase">{b.category}</span>
                    </div>
                    <Checkbox checked={b.visible} onCheckedChange={() => toggleVisibility(b.id)} />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsFilterOpen(false)} className="w-full bg-indigo-600 font-black uppercase">Save Preferences</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
              <Input 
                placeholder="evxl.app/u/username" 
                value={evxlUrl}
                onChange={(e) => setEvxlUrl(e.target.value)}
                className="bg-slate-950 border-slate-800 pl-10 text-xs"
              />
            </div>
            <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              className="bg-indigo-600 hover:bg-indigo-500 font-black uppercase text-[10px]"
            >
              {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : 'Sync Data'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benchmarks.filter(b => b.visible).map(b => (
              <div key={b.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                    <Trophy size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase italic">{b.name}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{b.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-indigo-400 uppercase">{b.rank}</span>
                  {b.verified && <Check size={10} className="text-emerald-500 ml-1 inline" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BenchmarkManager;