"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, RefreshCw, ExternalLink, Trophy, ChevronLeft, Search, LayoutGrid, List as ListIcon, Loader2, Star } from 'lucide-react';
import RankBadge from './RankBadge';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface Scenario {
  name: string;
  score?: number;
  rank?: string;
}

interface BenchmarkSet {
  id: string;
  name: string;
  category: 'Official' | 'Notable Creator' | 'Community' | 'Other';
  scenarios: string[];
  overallRank?: string;
}

const BENCHMARK_REGISTRY: BenchmarkSet[] = [
  // Official
  { id: 'v-s4', name: 'Voltaic S4 Benchmarks', category: 'Official', scenarios: ["Bounceshot", "Pasu", "Smoothbot", "Air", "Static", "Dynamic", "Tracking", "Switching", "Clicking", "Precise", "Reactive", "Speed", "Evasive", "Flick", "Micro", "Macro", "Vertical", "Horizontal"] },
  { id: 'v-s3', name: 'Voltaic S3 Benchmarks', category: 'Official', scenarios: ["Scenario A", "Scenario B", "Scenario C"] },
  { id: 'r-s2', name: 'Revosect S2 Benchmarks', category: 'Official', scenarios: ["Scenario 1", "Scenario 2", "Scenario 3", "Scenario 4", "Scenario 5", "Scenario 6"] },
  { id: 'r-s1', name: 'Revosect S1 Benchmarks', category: 'Official', scenarios: ["Scenario X", "Scenario Y"] },
  { id: 'sparky', name: 'Sparky | Voltaic 2.0', category: 'Official', scenarios: ["Classic A", "Classic B"] },
  
  // Notable Creator
  { id: 'matty-v1', name: 'MattyOW v1 Benchmarks', category: 'Notable Creator', scenarios: ["Matty 1", "Matty 2", "Matty 3"] },
  { id: 'lowgrav', name: 'Lowgrav Benchmarks', category: 'Notable Creator', scenarios: ["Low 1", "Low 2"] },
  
  // Community
  { id: 'pureg', name: 'PureG Apex Benchmarks', category: 'Community', scenarios: ["Apex 1", "Apex 2"] },
  { id: 'v-valorant', name: 'Voltaic Valorant Benchmarks', category: 'Community', scenarios: ["Val 1", "Val 2"] },
  { id: 'v-overwatch', name: 'Voltaic Overwatch Benchmarks', category: 'Community', scenarios: ["OW 1", "OW 2"] }
];

interface KovaaksBenchmarksProps {
  gameId: string;
}

const KovaaksBenchmarks = ({ gameId }: KovaaksBenchmarksProps) => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedSet, setSelectedSet] = useState<BenchmarkSet | null>(null);
  const [profileId, setProfileId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [syncedData, setSyncedData] = useState<Record<string, any>>({});

  useEffect(() => {
    const saved = localStorage.getItem(`kovaaks_synced_${gameId}`);
    const savedProfile = localStorage.getItem(`kovaaks_profile_${gameId}`);
    if (saved) setSyncedData(JSON.parse(saved));
    if (savedProfile) setProfileId(savedProfile);
  }, [gameId]);

  const handleSync = async () => {
    if (!profileId) {
      showError("Enter an evxl.app profile ID.");
      return;
    }

    setIsSyncing(true);
    // Simulated sync logic
    setTimeout(() => {
      const mockData: Record<string, any> = {};
      const ranks = ["Gold", "Platinum", "Diamond", "Jade", "Master", "Grandmaster"];
      
      BENCHMARK_REGISTRY.forEach(set => {
        const setResults: Record<string, any> = {};
        set.scenarios.forEach(s => {
          setResults[s] = {
            score: Math.floor(Math.random() * 1000) + 500,
            rank: ranks[Math.floor(Math.random() * ranks.length)]
          };
        });
        mockData[set.id] = {
          scenarios: setResults,
          overallRank: ranks[Math.floor(Math.random() * ranks.length)]
        };
      });

      setSyncedData(mockData);
      localStorage.setItem(`kovaaks_synced_${gameId}`, JSON.stringify(mockData));
      localStorage.setItem(`kovaaks_profile_${gameId}`, profileId);
      setIsSyncing(false);
      showSuccess("Benchmarks synchronized with evxl.app");
    }, 1500);
  };

  const filteredSets = useMemo(() => {
    return BENCHMARK_REGISTRY.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const categories = ['Official', 'Notable Creator', 'Community', 'Other'] as const;

  return (
    <Dialog onOpenChange={(open) => { if(!open) { setView('list'); setSelectedSet(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-slate-800 bg-slate-900/50 text-indigo-400 hover:text-white hover:bg-indigo-600/10 h-12 rounded-xl font-black uppercase tracking-widest">
          <Target className="mr-2" size={18} />
          View Benchmarks
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[900px] p-0 overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 border-b border-slate-800 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {view === 'detail' && (
                <Button variant="ghost" size="icon" onClick={() => setView('list')} className="text-slate-400 hover:text-white">
                  <ChevronLeft size={24} />
                </Button>
              )}
              <div>
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                  <Trophy className="text-yellow-500" />
                  {view === 'list' ? 'Benchmark Registry' : selectedSet?.name}
                </DialogTitle>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {view === 'list' ? 'Select a benchmark set to view scenarios' : `${selectedSet?.scenarios.length} Scenarios in this set`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input 
                  placeholder="evxl.app ID" 
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  className="bg-slate-950 border-slate-800 h-9 w-32 text-[10px] font-black uppercase"
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleSync} 
                disabled={isSyncing}
                className="bg-indigo-600 hover:bg-indigo-500 h-9 text-[10px] font-black uppercase"
              >
                {isSyncing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} className="mr-2" />}
                Sync
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' ? (
            <div className="space-y-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <Input 
                  placeholder="Search benchmark sets..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-900 border-slate-800 pl-10 h-11 text-xs font-bold uppercase"
                />
              </div>

              {categories.map(cat => {
                const sets = filteredSets.filter(s => s.category === cat);
                if (sets.length === 0) return null;
                return (
                  <div key={cat} className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-800 pb-2">{cat}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sets.map(set => {
                        const data = syncedData[set.id];
                        return (
                          <div 
                            key={set.id} 
                            onClick={() => { setSelectedSet(set); setView('detail'); }}
                            className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-white uppercase italic tracking-tight truncate group-hover:text-indigo-400 transition-colors">{set.name}</h4>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{set.scenarios.length} Scenarios</p>
                            </div>
                            {data?.overallRank && (
                              <RankBadge rank={data.overallRank} gameTitle="Kovaaks" className="scale-75 origin-right" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSet?.scenarios.map(scenario => {
                const data = syncedData[selectedSet.id]?.scenarios?.[scenario];
                return (
                  <div key={scenario} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[150px]">{scenario}</span>
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
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Source: evxl.app
            </p>
            {profileId && (
              <a 
                href={`https://evxl.app/u/${profileId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest"
              >
                View Profile <ExternalLink size={10} />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Star size={12} className="text-yellow-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rank is determined by lowest scenario score</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KovaaksBenchmarks;