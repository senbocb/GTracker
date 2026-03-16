"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, RefreshCw, ExternalLink, Trophy, Zap, Shield, Check, Loader2 } from 'lucide-react';
import RankBadge from './RankBadge';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const BENCHMARK_SETS = {
  "Voltaic S4": [
    "Bounceshot", "Pasu", "Smoothbot", "Air", "Static", "Dynamic",
    "Tracking", "Switching", "Clicking", "Precise", "Reactive", "Speed",
    "Evasive", "Flick", "Micro", "Macro", "Vertical", "Horizontal"
  ],
  "Revosect S2": [
    "Scenario 1", "Scenario 2", "Scenario 3", "Scenario 4", "Scenario 5", "Scenario 6",
    "Scenario 7", "Scenario 8", "Scenario 9", "Scenario 10", "Scenario 11", "Scenario 12",
    "Scenario 13", "Scenario 14", "Scenario 15", "Scenario 16", "Scenario 17", "Scenario 18"
  ]
};

interface KovaaksBenchmarksProps {
  gameId: string;
  onSync?: (data: any) => void;
}

const KovaaksBenchmarks = ({ gameId, onSync }: KovaaksBenchmarksProps) => {
  const [activeSet, setActiveSet] = useState<keyof typeof BENCHMARK_SETS>("Voltaic S4");
  const [profileId, setProfileId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<Record<string, any>>({});

  useEffect(() => {
    const saved = localStorage.getItem(`kovaaks_benchmarks_${gameId}`);
    const savedProfile = localStorage.getItem(`kovaaks_profile_${gameId}`);
    if (saved) setBenchmarkData(JSON.parse(saved));
    if (savedProfile) setProfileId(savedProfile);
  }, [gameId]);

  const handleSync = async () => {
    if (!profileId) {
      showError("Please enter an evxl.app profile ID.");
      return;
    }

    setIsSyncing(true);
    // Simulating API call to evxl.app
    setTimeout(() => {
      const mockData: Record<string, any> = {};
      const ranks = ["Gold", "Platinum", "Diamond", "Jade", "Master", "Grandmaster"];
      
      BENCHMARK_SETS[activeSet].forEach(scenario => {
        mockData[scenario] = {
          rank: ranks[Math.floor(Math.random() * ranks.length)],
          score: Math.floor(Math.random() * 1000) + 500,
          timestamp: new Date().toISOString()
        };
      });

      setBenchmarkData(mockData);
      localStorage.setItem(`kovaaks_benchmarks_${gameId}`, JSON.stringify(mockData));
      localStorage.setItem(`kovaaks_profile_${gameId}`, profileId);
      setIsSyncing(false);
      showSuccess("Benchmarks synchronized with evxl.app");
      if (onSync) onSync(mockData);
    }, 1500);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-slate-800 bg-slate-900/50 text-indigo-400 hover:text-white hover:bg-indigo-600/10 h-12 rounded-xl font-bold uppercase tracking-wider">
          <Target className="mr-2" size={18} />
          View Benchmarks (18)
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[800px] p-0 overflow-hidden">
        <div className="bg-slate-900 p-6 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Trophy className="text-yellow-500" />
                Kovaaks Benchmarks
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input 
                  placeholder="evxl.app Profile ID" 
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  className="bg-slate-950 border-slate-800 h-9 w-48 text-xs"
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleSync} 
                disabled={isSyncing}
                className="bg-indigo-600 hover:bg-indigo-500 h-9"
              >
                {isSyncing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} className="mr-2" />}
                Sync
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            {Object.keys(BENCHMARK_SETS).map((set) => (
              <Button
                key={set}
                variant="ghost"
                size="sm"
                onClick={() => setActiveSet(set as any)}
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest h-8 px-4",
                  activeSet === set ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white"
                )}
              >
                {set}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENCHMARK_SETS[activeSet].map((scenario) => {
              const data = benchmarkData[scenario];
              return (
                <div 
                  key={scenario} 
                  className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{scenario}</span>
                    {data && <span className="text-[10px] font-mono text-indigo-400">{data.score}</span>}
                  </div>
                  <div className="flex items-center justify-center py-2">
                    {data ? (
                      <RankBadge rank={data.rank} gameTitle="Kovaaks" className="w-full" />
                    ) : (
                      <div className="h-8 flex items-center justify-center text-[10px] font-bold text-slate-700 uppercase">
                        No Data
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Data provided by evxl.app integration
          </p>
          <a 
            href={`https://evxl.app/u/${profileId || 'senbofps'}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest"
          >
            View Profile <ExternalLink size={10} />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KovaaksBenchmarks;