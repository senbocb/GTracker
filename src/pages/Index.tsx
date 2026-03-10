"use client";

import React, { useEffect, useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import GameCard from '@/components/GameCard';
import GameListItem from '@/components/GameListItem';
import MatchHistory from '@/components/MatchHistory';
import SessionTracker from '@/components/SessionTracker';
import AddMatchModal from '@/components/AddMatchModal';
import LayoutSettings, { LayoutSection } from '@/components/LayoutSettings';
import QuickStatsSettings, { QuickStatConfig } from '@/components/QuickStatsSettings';
import { Plus, LayoutDashboard, History, Settings, User, Bell, Gamepad2, Activity, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DEFAULT_LAYOUT: LayoutSection[] = [
  { id: 'quick_stats', label: 'Quick Stats', enabled: true },
  { id: 'active_operations', label: 'Games', enabled: true },
  { id: 'session_tracker', label: 'Session Tracker', enabled: true },
  { id: 'match_history', label: 'Match History', enabled: true },
];

const Index = () => {
  const [games, setGames] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [layout, setLayout] = useState<LayoutSection[]>(DEFAULT_LAYOUT);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [statConfigs, setStatConfigs] = useState<QuickStatConfig[]>([]);
  const [isCompact, setIsCompact] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    setGames(savedGames);

    const savedProfile = JSON.parse(localStorage.getItem('combat_profile') || 'null');
    setProfile(savedProfile);

    const savedLayout = JSON.parse(localStorage.getItem('combat_layout') || 'null');
    if (savedLayout) setLayout(savedLayout);

    const savedSettings = JSON.parse(localStorage.getItem('combat_settings') || 'null');
    if (savedSettings) setIsCompact(savedSettings.compactDashboard);

    const savedStats = JSON.parse(localStorage.getItem('combat_stat_configs') || 'null');
    if (savedStats) {
      setStatConfigs(savedStats);
    } else {
      const initial: QuickStatConfig[] = [
        { id: 'active_trackers', label: 'Active Trackers', enabled: true, type: 'common' },
        { id: 'total_logs', label: 'Total Logs', enabled: true, type: 'common' },
        { id: 'avg_winrate', label: 'Avg Win Rate', enabled: true, type: 'common' },
        { id: 'op_status', label: 'Operational Status', enabled: true, type: 'common' },
      ];
      savedGames.forEach((g: any) => {
        initial.push({ id: `peak_${g.id}`, label: `${g.title} Peak`, enabled: false, type: 'game', gameId: g.id });
      });
      setStatConfigs(initial);
    }

    const allMatches: any[] = [];
    savedGames.forEach((game: any) => {
      game.modes.forEach((mode: any) => {
        (mode.history || []).forEach((log: any) => {
          allMatches.push({
            id: log.id,
            game: game.title,
            result: log.isPeak ? 'Peak Reached' : 'Rank Update',
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

  const getStatValue = (config: QuickStatConfig) => {
    if (config.id === 'active_trackers') return games.length.toString();
    if (config.id === 'total_logs') return games.reduce((acc, g) => acc + g.modes.reduce((mAcc: number, m: any) => mAcc + (m.history?.length || 0), 0), 0).toString();
    if (config.id === 'avg_winrate') {
      const avg = games.length > 0 ? Math.round(games.reduce((acc, g) => acc + parseInt(g.winRate || '0'), 0) / games.length) : 0;
      return `${avg}%`;
    }
    if (config.id === 'op_status') return 'Active';
    if (config.type === 'game') {
      const game = games.find(g => g.id === config.gameId);
      return game?.modes[0]?.peakRank || 'N/A';
    }
    return 'N/A';
  };

  const renderSection = (id: string) => {
    const section = layout.find(s => s.id === id);
    if (!section || !section.enabled) return null;

    switch (id) {
      case 'quick_stats':
        return (
          <div key="quick_stats" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tactical Overview</h2>
              <QuickStatsSettings configs={statConfigs} onUpdate={updateStatConfigs} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statConfigs.filter(c => c.enabled).map((config) => (
                <div key={config.id} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm group hover:border-indigo-500/30 transition-all hover-highlight">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Activity size={12} className="text-indigo-500" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{config.label}</span>
                  </div>
                  <p className="text-2xl font-black text-white tabular-nums">{getStatValue(config)}</p>
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
                Games
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-900/50 border border-slate-800 rounded-lg p-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-8 w-8 rounded-md", viewMode === 'card' ? "bg-indigo-600 text-white" : "text-slate-500 hover-highlight")}
                    onClick={() => setViewMode('card')}
                  >
                    <LayoutGrid size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-8 w-8 rounded-md", viewMode === 'list' ? "bg-indigo-600 text-white" : "text-slate-500 hover-highlight")}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={16} />
                  </Button>
                </div>
                <Link to="/add-game">
                  <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 font-bold text-[10px] uppercase tracking-widest hover-highlight">
                    <Plus size={14} className="mr-1" /> Add Game
                  </Button>
                </Link>
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
              <div className="p-16 rounded-[2rem] border-2 border-dashed border-slate-800/50 flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/10">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-slate-700 shadow-inner">
                  <Gamepad2 size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-400">No Games Tracked</h3>
                  <p className="text-slate-600 max-w-xs mx-auto text-sm">Deploy your first game tracker to begin monitoring your competitive performance metrics.</p>
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
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Recent Engagements</h2>
            <MatchHistory matches={recentMatches} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Gamepad2 className="text-white" size={20} />
              </div>
              <span className="text-lg font-black italic uppercase tracking-tighter text-white hidden sm:block">GTracker.app</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/">
                <Button variant="ghost" className="text-slate-400 hover:text-white font-bold text-[11px] uppercase tracking-widest px-4 hover-highlight">Dashboard</Button>
              </Link>
              <Link to="/history">
                <Button variant="ghost" className="text-slate-400 hover:text-white font-bold text-[11px] uppercase tracking-widest px-4 hover-highlight">History</Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" className="text-slate-400 hover:text-white font-bold text-[11px] uppercase tracking-widest px-4 hover-highlight">Settings</Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800">
              <Search size={14} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Search games..." 
                className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-300 placeholder:text-slate-600 w-32"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative hover-highlight">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950" />
            </Button>

            <Link to="/profile">
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800 group cursor-pointer hover-highlight rounded-r-xl py-2 pr-2">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none mb-1">{profile?.username || 'OPERATOR'}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest leading-none">Level {Math.floor((profile?.xp || 0) / 100) + 1}</p>
                </div>
                <Avatar className="w-10 h-10 border-2 border-slate-800 group-hover:border-indigo-500 transition-colors">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback className="bg-slate-900 text-slate-400 font-black">
                    {profile?.username?.substring(0, 2).toUpperCase() || 'OP'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content Area */}
          <div className="flex-1 space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white italic uppercase">Operational Status</h1>
                <p className="text-slate-500 font-medium text-sm">Real-time performance metrics and deployment status.</p>
              </div>
              <LayoutSettings sections={layout} onUpdate={updateLayout} />
            </div>

            {layout
              .filter(s => ['quick_stats', 'active_operations'].includes(s.id))
              .map(s => renderSection(s.id))}
          </div>

          {/* Sidebar Intel Panel */}
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
    </div>
  );
};

export default Index;