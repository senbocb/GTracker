"use client";

import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import GameCard from '@/components/GameCard';
import ProgressChart from '@/components/ProgressChart';
import MatchHistory from '@/components/MatchHistory';
import { Plus, LayoutDashboard, History, Settings, User, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-20 hidden md:flex flex-col items-center py-8 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl z-50">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-12 shadow-lg shadow-blue-600/20">
          <LayoutDashboard className="text-white" size={24} />
        </div>
        <nav className="flex flex-col gap-8">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/10">
            <History size={24} />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/10">
            <User size={24} />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/10">
            <Settings size={24} />
          </Button>
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
            <p className="text-slate-400 font-medium">Welcome back, Commander. Your climb continues.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-6 rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="mr-2" size={20} />
            ADD NEW GAME
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Game Cards */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GameCard 
                title="Valorant"
                rank="Diamond"
                tier="3"
                peakRank="Ascendant 1"
                winRate="54.2%"
                hoursPlayed="420h"
                image="https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=1000&auto=format&fit=crop"
              />
              <GameCard 
                title="Counter-Strike 2"
                rank="Global"
                tier="Elite"
                peakRank="Global Elite"
                winRate="51.8%"
                hoursPlayed="1,240h"
                image="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full" />
                PERFORMANCE ANALYTICS
              </h2>
              <ProgressChart />
            </div>
          </div>

          {/* Right Column: History & Stats */}
          <div className="space-y-8">
            <MatchHistory />
            
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-600/20">
              <h3 className="text-lg font-black italic mb-4 uppercase tracking-tighter">Season Goal</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Progress to Immortal</p>
                  <p className="text-2xl font-black">72%</p>
                </div>
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[72%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
                <p className="text-xs opacity-70 leading-relaxed">
                  You need approximately <span className="font-bold text-white">12 more wins</span> than losses to reach your goal.
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