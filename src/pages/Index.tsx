"use client";

import React, { useEffect, useState } from 'react';
import GameCard from '@/components/GameCard';
import GameListItem from '@/components/GameListItem';
import MatchHistory from '@/components/MatchHistory';
import SessionTracker from '@/components/SessionTracker';
import AddMatchModal from '@/components/AddMatchModal';
import LayoutSettings, { LayoutSection } from '@/components/LayoutSettings';
import QuickStatsSettings, { QuickStatConfig } from '@/components/QuickStatsSettings';
import { Plus, Gamepad2, Activity, LayoutGrid, List, Trophy, Terminal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AppLayout from '@/components/AppLayout';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const DEFAULT_LAYOUT: LayoutSection[] = [
  { id: 'quick_stats', label: 'Overview', enabled: true },
  { id: 'active_operations', label: 'Games', enabled: true },
  { id: 'session_tracker', label: 'Live Intel', enabled: true },
  { id: 'match_history', label: 'Recent Changes', enabled: true },
];

const Index = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [layout, setLayout] = useState<LayoutSection[]>(DEFAULT_LAYOUT);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [statConfigs, setStatConfigs] = useState<QuickStatConfig[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch Games
      const { data: gamesData } = await supabase
        .from('games')
        .select('*, game_modes(*, game_history(*))')
        .eq('user_id', user.id);
      
      if (gamesData) {
        const formattedGames = gamesData.map(g => ({
          ...g,
          modes: g.game_modes.map((m: any) => ({
            ...m,
            history: m.game_history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          }))
        }));
        setGames(formattedGames);

        // Extract recent matches
        const allMatches: any[] = [];
        formattedGames.forEach(game => {
          game.modes.forEach((mode: any) => {
            mode.history.forEach((log: any) => {
              allMatches.push({
                id: log.id,
                game: game.title,
                result: 'Rank Update',
                change: log.rank,
                map: mode.name,
                score: log.tier || '',
                date: new Date(log.timestamp).toLocaleDateString()
              });
            });
          });
        });
        setRecentMatches(allMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5));
      }

      // Fetch Layout Settings from Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('layout_settings, stat_configs')
        .eq('id', user.id)
        .single();

      if (profileData?.layout_settings) {
        setLayout(profileData.layout_settings);
      }
      if (profileData?.stat_configs) {
        setStatConfigs(profileData.stat_configs);
      } else {
        setStatConfigs([
          { id: 'active_trackers', label: 'Games Tracked', enabled: true, type: 'common' },
          { id: 'total_logs', label: 'Total Logs', enabled: true, type: 'common' },
        ]);
      }
    };

    fetchData();
  }, [user]);

  const updateLayout = async (newLayout: LayoutSection[]) => {
    setLayout(newLayout);
    if (user) {
      await supabase.from('profiles').update({ layout_settings: newLayout }).eq('id', user.id);
    }
  };

  const updateStatConfigs = async (newConfigs: QuickStatConfig[]) => {
    setStatConfigs(newConfigs);
    if (user) {
      await supabase.from('profiles').update({ stat_configs: newConfigs }).eq('id', user.id);
    }
  };

  const getStatValue = (config: QuickStatConfig) => {
    if (config.id === 'active_trackers') return games.length.toString();
    if (config.id === 'total_logs') return games.reduce((acc, g) => acc + g.modes.reduce((mAcc: number, m: any) => mAcc + (m.history?.length || 0), 0), 0).toString();
    return 'N/A';
  };

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-500">
              <Terminal size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black italic uppercase tracking-tight text-white">Dashboard Overview</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status: Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <LayoutSettings sections={layout} onUpdate={updateLayout} />
            <Link to="/add-game" className="flex-1 sm:flex-none">
              <Button variant="outline" size="sm" className="w-full border-slate-800 bg-slate-950 text-slate-400 hover:text-white">
                <Plus size={16} className="mr-2" />
                Add Game
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-10">
            {layout.find(s => s.id === 'quick_stats')?.enabled && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Terminal size={12} className="text-indigo-500" />
                    System Overview
                  </h2>
                  <QuickStatsSettings configs={statConfigs} onUpdate={updateStatConfigs} games={games} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {statConfigs.filter(c => c.enabled).map((config) => (
                    <div key={config.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/50 backdrop-blur-md group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <Activity size={12} className="text-indigo-500" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{config.label}</span>
                      </div>
                      <p className="text-2xl font-black text-white tabular-nums truncate">{getStatValue(config)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {layout.find(s => s.id === 'active_operations')?.enabled && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white flex items-center gap-3 italic uppercase tracking-tight">
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                    Tracked Games
                  </h2>
                  <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-8 w-8 rounded-md", viewMode === 'card' ? "bg-indigo-600 text-white" : "text-slate-400")}
                      onClick={() => setViewMode('card')}
                    >
                      <LayoutGrid size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-8 w-8 rounded-md", viewMode === 'list' ? "bg-indigo-600 text-white" : "text-slate-400")}
                      onClick={() => setViewMode('list')}
                    >
                      <List size={16} />
                    </Button>
                  </div>
                </div>
                {games.length > 0 ? (
                  <div className={cn(viewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-3")}>
                    {games.map((game) => (
                      viewMode === 'card' ? <GameCard key={game.id} {...game} /> : <GameListItem key={game.id} {...game} />
                    ))}
                  </div>
                ) : (
                  <div className="p-16 rounded-[2rem] border-2 border-dashed border-slate-800/50 flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/40 backdrop-blur-sm">
                    <Gamepad2 size={40} className="text-slate-600" />
                    <h3 className="text-xl font-bold text-slate-300">No Games Tracked</h3>
                    <Link to="/add-game"><Button className="bg-indigo-600">Add Game</Button></Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="w-full lg:w-80 space-y-10">
            {layout.find(s => s.id === 'session_tracker')?.enabled && (
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Session Stats</h2>
                <SessionTracker />
                <AddMatchModal />
              </div>
            )}
            {layout.find(s => s.id === 'match_history')?.enabled && (
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Recent Changes</h2>
                <MatchHistory matches={recentMatches} />
              </div>
            )}
          </aside>
        </div>
      </main>
    </AppLayout>
  );
};

export default Index;