"use client";

import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import GameCard from '@/components/GameCard';
import ProgressChart from '@/components/ProgressChart';
import MatchHistory from '@/components/MatchHistory';
import SessionTracker from '@/components/SessionTracker';
import AddMatchModal from '@/components/AddMatchModal';
import { Plus, LayoutDashboard, History, Settings, User, Bell, Gamepad2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Index = () => {
  // Empty state for games
  const games: any[] = [];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Sidebar Navigation */}
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

      {/* Main Content */}
      <main className="md:ml-20 p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">COMMAND CENTER</h1>
            <p className="text-slate-400 font-medium">Initialize your trackers to begin data collection.</p>
          </div>
          <Link to="/add-game">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-6 rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
              <Plus className="mr-2" size={20} />
              ADD NEW GAME
            </Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Game Cards & Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {games.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map((game, i) => (
                  <GameCard key={i} {...game} />
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/20">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-700">
                  <Gamepad2 size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-500">No Active Trackers</h3>
                  <p className="text-slate-600 max-w-xs mx-auto">Add your first game to start monitoring your competitive performance.</p>
                </div>
                <Link to="/add-game">
                  <Button variant="outline" className="border-slate-800 hover:bg-slate-800">
                    Initialize Tracker
                  </Button>
                </Link>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full" />
                PERFORMANCE ANALYTICS
              </h2>
              <ProgressChart data={[]} />
            </div>
          </div>

          {/* Right Column: Session, History & Goals */}
          <div className="space-y-8">
            <SessionTracker />
            
            <AddMatchModal />

            <MatchHistory matches={[]} />
            
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white">
              <h3 className="text-lg font-black italic mb-4 uppercase tracking-tighter text-slate-500">Season Goal</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-sm font-bold opacity-50 uppercase tracking-widest">No Goal Set</p>
                  <p className="text-2xl font-black text-slate-800">0%</p>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 w-0 rounded-full" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Define a target rank in your settings to track your seasonal progress.
                </p>
              </div>
            </div>
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