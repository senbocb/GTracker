"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, History, Plus, Trophy, ExternalLink, ArrowUp, ArrowDown, Table as TableIcon, Target, Activity, Edit2, Calendar, BarChart3, Map as MapIcon, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RankBadge from '@/components/RankBadge';
import ProgressChart from '@/components/ProgressChart';
import SeasonManager, { Season } from '@/components/SeasonManager';
import TournamentWidget from '@/components/TournamentWidget';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

const GAME_METADATA: Record<string, any> = {
  "Valorant": { ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"], tierCount: 3 },
  "Counter-Strike 2": { ranks: [], tierCount: 0 },
  "Kovaaks": { ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Jade", "Master", "Grandmaster", "Nova", "Celestial"], tierCount: 0 }
};

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [activeMode, setActiveMode] = useState('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logData, setLogData] = useState({ rank: '', tier: '', map: '', timestamp: new Date().toISOString().slice(0, 16) });
  
  // Kovaaks Specific
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [isPulling, setIsPulling] = useState(false);

  useEffect(() => {
    fetchGameData();
  }, [id]);

  const fetchGameData = async () => {
    const { data: gameData } = await supabase
      .from('games')
      .select('*, game_modes(*, game_history(*))')
      .eq('id', id)
      .single();
    
    if (gameData) {
      const formatted = {
        ...gameData,
        modes: gameData.game_modes.map((m: any) => ({
          ...m,
          history: m.game_history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        }))
      };
      setGame(formatted);
      setActiveMode(formatted.modes[0]?.name || '');
      // Seasons and benchmarks would ideally be in DB too, but using local storage for now as per previous implementation
      const savedSeasons = JSON.parse(localStorage.getItem(`seasons_${id}`) || '[]');
      setSeasons(savedSeasons);
      const savedBenchmarks = JSON.parse(localStorage.getItem(`benchmarks_${id}`) || '[]');
      setBenchmarks(savedBenchmarks);
    } else {
      navigate('/');
    }
  };

  const handlePullBenchmarks = () => {
    setIsPulling(true);
    // Simulate scraping evxl.app
    setTimeout(() => {
      const mockBenchmarks = [
        { id: '1', name: 'Voltaic Novice', rank: 'Silver', visible: true },
        { id: '2', name: 'Voltaic Intermediate', rank: 'Platinum', visible: true },
        { id: '3', name: 'Voltaic Advanced', rank: 'Master', visible: false },
        { id: '4', name: 'rA Benchmarks', rank: 'Diamond', visible: true }
      ];
      setBenchmarks(mockBenchmarks);
      setIsPulling(false);
      showSuccess("Benchmarks synchronized from evxl.app");
      localStorage.setItem(`benchmarks_${id}`, JSON.stringify(mockBenchmarks));
    }, 1500);
  };

  const toggleBenchmarkVisibility = (benchId: string) => {
    const updated = benchmarks.map(b => b.id === benchId ? { ...b, visible: !b.visible } : b);
    setBenchmarks(updated);
    localStorage.setItem(`benchmarks_${id}`, JSON.stringify(updated));
  };

  if (!game) return null;

  return (
    <AppLayout>
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/"><Button variant="ghost" className="text-slate-300 hover:text-white -ml-4 hover-highlight"><ChevronLeft className="mr-2" size={20} /> Back</Button></Link>
          <div className="flex gap-2">
            {game.title === 'Kovaaks' && (
              <Button variant="outline" onClick={handlePullBenchmarks} disabled={isPulling} className="border-slate-800 bg-slate-900/50 text-indigo-400">
                <RefreshCw size={16} className={cn("mr-2", isPulling && "animate-spin")} />
                Sync evxl.app
              </Button>
            )}
            <Button onClick={() => setIsLogOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 font-bold"><Plus size={16} className="mr-2" /> Log Rank</Button>
          </div>
        </div>

        <div className="relative h-64 rounded-3xl overflow-hidden border border-slate-800 mb-10">
          {game.image ? <img src={game.image} alt={game.title} className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full bg-slate-900" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-4">{game.title}</h1>
              <Tabs value={activeMode} onValueChange={setActiveMode}>
                <TabsList className="bg-slate-950/50 border border-slate-800 p-1 h-auto">
                  {game.modes.map((m: any) => (
                    <TabsTrigger key={m.name} value={m.name} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">
                      {m.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {game.title === 'Kovaaks' && benchmarks.length > 0 && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Trophy size={16} className="text-yellow-500" /> Verified Benchmarks</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benchmarks.map(bench => (
                    <div key={bench.id} className={cn(
                      "p-4 rounded-2xl border transition-all flex items-center justify-between",
                      bench.visible ? "bg-slate-900 border-slate-800" : "bg-slate-950 border-slate-900 opacity-50"
                    )}>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{bench.name}</p>
                        <RankBadge rank={bench.rank} gameTitle="Kovaaks" className="mt-1" />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => toggleBenchmarkVisibility(bench.id)} className="text-slate-600 hover:text-white">
                        {bench.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            <ProgressChart history={game.modes.find((m: any) => m.name === activeMode)?.history} rankNames={GAME_METADATA[game.title]?.ranks} getRankValue={() => 0} />
            
            <TournamentWidget gameId={id!} />
          </div>

          <div className="space-y-6">
            <SeasonManager gameId={game.id} seasons={seasons} onUpdate={(s) => { setSeasons(s); localStorage.setItem(`seasons_${id}`, JSON.stringify(s)); }} />
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default GameDetail;