"use client";

import React, { useEffect, useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import GameCard from '@/components/GameCard';
import ProgressChart from '@/components/ProgressChart';
import MatchHistory from '@/components/MatchHistory';
import SessionTracker from '@/components/SessionTracker';
import AddMatchModal from '@/components/AddMatchModal';
import LayoutSettings, { LayoutSection } from '@/components/LayoutSettings';
import { Plus, LayoutDashboard, History, Settings, User, Bell, Gamepad2, Activity, Target, Zap, ShieldAlert, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const DEFAULT_LAYOUT: LayoutSection[] = [
  { id: 'readiness_score', label: 'Combat Readiness', enabled: true },
  { id: 'quick_stats', label: 'Quick Stats', enabled: true },
  { id: 'active_operations', label: 'Active Operations', enabled: true },
  { id: 'performance_analytics', label: 'Performance Analytics', enabled: true },
  { id: 'session_tracker', label: 'Session Tracker', enabled: true },
  { id: 'match_history', label: 'Match History', enabled: true },
  { id: 'daily_challenge', label: 'Daily Challenge', enabled: true },
];

const Index = () => {
  const [games, setGames] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [layout, setLayout] = useState<LayoutSection[]>(DEFAULT_LAYOUT);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    setGames(savedGames);

    const savedProfile = JSON.parse(localStorage.getItem('combat_profile') || 'null');
    setProfile(savedProfile);

    const savedLayout = JSON.parse(localStorage.getItem('combat_layout') || 'null');
    if (savedLayout) setLayout(savedLayout);

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

  const totalEngagements = games.reduce((acc, g) => acc + g.modes.reduce((mAcc: number, m: any) => mAcc + (m.history?.length || 0), 0), 0);
  const avgWinRate = games.length > 0 
    ? Math.round(games.reduce((acc, g) => acc + parseInt(g.winRate || '0'), 0) / games.length) 
    : 0;

  const renderSection = (id: string) => {
    const section = layout.find(s => s.id === id);
    if (!section || !section.enabled) return null;

    switch (id) {
      case 'readiness_score':
        return (
          <div key="readiness_score" className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                  <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="226" strokeDashoffset={226 - (226 * 0.85)} className="text-blue-500" />
                </svg>
                <span className="absolute text-xl font-black text-white">85</span>
              </div>
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Combat Readiness Score</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Status: Optimal • Performance +12% vs Last Week</p>
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              <ShieldAlert className="text-yellow-500" size={20} />
              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Warm-up Recommended</span>
            </div>
          </div>
        );
      case 'quick_stats':
        return (
          <div key="quick_stats" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Active Trackers', value: games.length.toString(), icon: Gamepad2, color: 'text-blue-500' },
              { label: 'Total Logs', value: totalEngagements.toString(), icon: Activity, color: 'text-emerald-500' },
              { label: 'Avg Win Rate', value: `${avgWinRate}%`, icon: Target, color: 'text-purple-500' },
              { label: 'Operational Status', value: 'Active', icon: Zap, color: 'text-yellow-500' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon size={16} className={stat.color} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        );
      case 'active_operations':
        return (
          <div key="active_operations" className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full" />
              ACTIVE OPERATIONS
            </h2>
            {games.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            ) : (
              <div className="p-16 rounded-3xl border-2 border-dashed border-slate-800/50 flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/10">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-slate-700 shadow-inner">
                  <Gamepad2 size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-400">No Active Trackers</h3>
                  <p className="text-slate-600 max-w-xs mx-auto text-sm">Deploy your first game tracker to begin monitoring your competitive performance metrics.</p>
                </div>
                <Link to="/add-game">
                  <Button variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-400 font-bold px-8">
                    Initialize Tracker
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );
      case 'daily_challenge':
        return (
          <div key="daily_challenge" className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy size={80} />
            </div>
            <h3 className="text-lg font-black italic mb-4 uppercase tracking-tighter text-blue-500">Daily Challenge</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-white uppercase tracking-widest">Win 3 Matches in a Row</p>
                <p className="text-xs font-bold text-slate-500">1/3</p>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-1/3 rounded-full" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Reward: +500 XP • Profile Medal</p>
            </div>
          </div>
        );
      case 'session_tracker':
        return (
          <div key="session_tracker" className="space-y-4">
            <SessionTracker />
            <AddMatchModal />
          </div>
        );
      case 'match_history':
        return (
          <div key="match_history" className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full" />
              RECENT ACTIVITY
            </h2>
            <MatchHistory matches={recentMatches} />
          </div>
        );
      default:
        return null;
    }
  };

  const mainSectionIds = ['readiness_score', 'quick_stats', 'active_operations', 'performance_analytics'];
  const sidebarSectionIds = ['session_tracker', 'match_history', 'daily_challenge'];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      <aside className="fixed left-0 top-0 h-full w-20 hidden md:flex flex-col items-center py-8 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl z-50">
        <Link to="/">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-12 shadow-lg shadow-blue-600/20 cursor-pointer hover:scale-105 transition-transform">
            <LayoutDashboard className="text-white" size={24} />
          </div>
        </Link>
        <nav className="flex flex-col gap-8">
          <Link to="/history">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/10">
              <History size={24} />
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/10">
              <User size={24} />
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/10">
              <Settings size={24} />
            </Button>
          </Link>
        </nav>
        <div className="mt-auto">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Bell size={20} />
          </Button>
        </div>
      </aside>

      <main className="md:ml-20 p-6 md:p-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">
              {profile?.username ? `${profile.username}'S COMMAND CENTER` : 'COMMAND CENTER'}
            </h1>
            <p className="text-slate-400 font-medium">Operational overview and tactical performance monitoring.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LayoutSettings sections={layout} onUpdate={updateLayout} />
            <Link to="/add-game">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-6 rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2" size={20} />
                INITIALIZE TRACKER
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {layout
              .filter(s => mainSectionIds.includes(s.id))
              .map(s => renderSection(s.id))}
          </div>

          <div className="space-y-8">
            {layout
              .filter(s => sidebarSectionIds.includes(s.id))
              .map(s => renderSection(s.id))}
          </div>
        </div>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
};

export default Index;