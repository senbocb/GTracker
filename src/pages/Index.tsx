"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
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

const DEFAULT_LAYOUT: LayoutSection[] = [
  { id: 'quick_stats', label: 'Overview', enabled: true },
  { id: 'active_operations', label: 'Games', enabled: true },
  { id: 'session_tracker', label: 'Live Intel', enabled: true },
  { id: 'match_history', label: 'Recent Changes', enabled: true },
];

const Index = () => {
  const [games, setGames] = useState<any[]>([]);
  const [layout, setLayout] = useState<LayoutSection[]>(DEFAULT_LAYOUT);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [statConfigs, setStatConfigs] = useState<QuickStatConfig[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [registry, setRegistry] = useState<any>({});

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    setGames(savedGames);

    const savedRegistry = JSON.parse(localStorage.getItem('combat_game_registry') || '{}');
    setRegistry(savedRegistry);

    const savedLayout = JSON.parse(localStorage.getItem('combat_layout') || 'null');
    if (savedLayout) {
      const mergedLayout = DEFAULT_LAYOUT.map(def => {
        const saved = savedLayout.find((s: any) => s.id === def.id);
        return saved ? { ...def, ...saved } : def;
      });
      setLayout(mergedLayout);
    }

    const savedStats = JSON.parse(localStorage.getItem('combat_stat_configs') || 'null');
    if (savedStats) {
      setStatConfigs(savedStats.filter((c: any) => !['avg_winrate', 'op_status'].includes(c.id)));
    } else {
      const initial: QuickStatConfig[] = [
        { id: 'active_trackers', label: 'Games Tracked', enabled: true, type: 'common' },
        { id: 'total_logs', label: 'Total Logs', enabled: true, type: 'common' },
      ];
      setStatConfigs(initial);
    }

    const allMatches: any[] = [];
    savedGames.forEach((game: any) => {
      game.modes.forEach((mode: any) => {
        (mode.history || []).forEach((log: any) => {
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
  }, []);

  const updateLayout = (newLayout: LayoutSection[]) => {
    setLayout(newLayout);
    localStorage.setItem('combat_layout', JSON.stringify(newLayout));
  };

  const updateStatConfigs = (newConfigs: QuickStatConfig[]) => {
    setStatConfigs(newConfigs);
    localStorage.setItem('combat_stat_configs', JSON.stringify(newConfigs));
  };

  const getRankValue = (gameTitle: string, rankName: string) => {
    const gameDef = registry[gameTitle];
    if (!gameDef || !gameDef.ranks) return 0;
    return gameDef.ranks.indexOf(rankName);
  };

  const getStatValue = (config: QuickStatConfig) => {
    if (config.id === 'active_trackers') return games.length.toString();
    if (config.id === 'total_logs') return games.reduce((acc, g) => acc + g.modes.reduce((mAcc: number, m: any) => mAcc + (m.history?.length || 0), 0), 0).toString();
    
    if (config.type === 'game' && config.gameId && config.modeName) {
      const game = games.find(g => g.id === config.gameId);
      if (!game) return 'N/A';
      
      const mode = game.modes.find((m: any) => m.name === config.modeName);
      if (!mode || !mode.history || mode.history.length === 0) return 'N/A';
      
      const peak = mode.history.reduce((prev: any, curr: any) => {
        const valPrev = getRankValue(game.title, prev.rank);
        const valCurr = getRankValue(game.title, curr.rank);
        return valCurr >= valPrev ? curr : prev;
      });
      
      return peak.rank;
    }
    return 'N/A';
  };

  const renderSection = (id: string) => {
    const section = layout.find(s => s.id === id);
    if (!section || !section.enabled) return null;

    switch (id) {
      case 'quick_stats':
        return (
          <div key="quick_stats" className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal size={12} className="text-indigo-500" />
                System Overview
              </h2>
              <QuickStatsSettings configs={statConfigs} onUpdate={updateStatConfigs} games={games} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statConfigs.filter(c => c.enabled).map((config) => (
                <div key={config.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/50 backdrop-blur-md group hover:border-indigo-500/30 transition-all hover-highlight">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      {config.type === 'game' ? <Trophy size={12} className="text-yellow-500" /> : <Activity size={12} className="text-indigo-500" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{config.label}</span>
                      {config.type === 'game' && (
                        <span className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">
                          {games.find(g => g.id === config.gameId)?.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white tabular-nums truncate">{getStatValue(config)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'active_operations':
        return (
          <div key="active_operations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white flex items-center gap-3 italic uppercase tracking-tight">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                Active Operations
              </h2>
              <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-md", viewMode === 'card' ? "bg-indigo-600 text-white" : "text-slate-400 hover-highlight")}
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 rounded-md", viewMode === 'list' ? "bg-indigo-600 text-white" : "text-slate-400 hover-highlight")}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
            {games.length > 0 ? (
              <div className={cn(
                viewMode === 'card' 
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
                  : "flex flex-col gap-3"
              )}>
                {games.map((game) => (
                  viewMode === 'card' 
                    ? <GameCard key={game.id} {...game} />
                    : <GameListItem key={game.id} {...game} />
                ))}
              </div>
            ) : (
              <div className="p-16 rounded-[2rem] border-2 border-dashed border-slate-800/50 flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/40 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-slate-600 shadow-inner">
                  <Gamepad2 size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-300">No Operations Tracked</h3>
                  <p className="text-slate-400 max-w-xs mx-auto text-sm">Deploy your first game tracker to begin monitoring your competitive performance metrics.</p>
                </div>
                <Link to="/add-game">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-6 rounded-2xl shadow-lg shadow-indigo-600/20">
                    Initialize Tracker
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );
      case 'session_tracker':
        return (
          <div key="session_tracker" className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Live Intel</h2>
            <SessionTracker />
            <AddMatchModal />
          </div>
        );
      case 'match_history':
        return (
          <div key="match_history" className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Recent Changes</h2>
            <MatchHistory matches={recentMatches} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
        {/* Command Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-500">
              <Terminal size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black italic uppercase tracking-tight text-white">Command Center</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operational Status: Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <LayoutSettings sections={layout} onUpdate={updateLayout} />
            <Link to="/add-game" className="flex-1 sm:flex-none">
              <Button variant="outline" size="sm" className="w-full border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover-highlight">
                <Plus size={16} className="mr-2" />
                ADD OPERATION
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-10">
            {layout
              .filter(s => ['quick_stats', 'active_operations'].includes(s.id))
              .map(s => renderSection(s.id))}
          </div>

          <aside className="w-full lg:w-80 space-y-10">
            {layout
              .filter(s => ['session_tracker', 'match_history'].includes(s.id))
              .map(s => renderSection(s.id))}
          </aside>
        </div>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </AppLayout>
  );
};

export default Index;