"use client";

import React, { useEffect, useState } from 'react';
import GameCard from '@/components/GameCard';
import GameListItem from '@/components/GameListItem';
import MatchHistory from '@/components/MatchHistory';
import SessionTracker from '@/components/SessionTracker';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AppLayout from '@/components/AppLayout';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";

const Index = () => {
  const { user, profile } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: gamesData } = await supabase
      .from('games')
      .select('*, game_modes(*, game_history(*))')
      .eq('user_id', user?.id);
    
    if (gamesData) {
      const formatted = gamesData.map(g => ({
        ...g,
        modes: g.game_modes.map((m: any) => ({
          ...m,
          history: m.game_history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        }))
      }));
      setGames(formatted);

      const allMatches: any[] = [];
      formatted.forEach(game => {
        game.modes.forEach((mode: any) => {
          mode.history.forEach((log: any) => {
            allMatches.push({
              id: log.id,
              game: game.title,
              result: 'Update',
              change: log.rank,
              map: mode.name,
              date: new Date(log.timestamp).toLocaleDateString()
            });
          });
        });
      });
      setRecentMatches(allMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5));
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, {profile?.username || 'Operator'}</h1>
            <p className="text-slate-400 mt-1">Here's what's happening with your performance today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/add-game">
              <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 rounded-full px-6">
                <Plus size={18} className="mr-2" />
                Add Game
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Your Games</h2>
                <div className="flex items-center bg-slate-900/50 border border-slate-800/50 rounded-lg p-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-8 w-8 rounded-md", viewMode === 'card' ? "bg-slate-800 text-white" : "text-slate-500")}
                    onClick={() => setViewMode('card')}
                  >
                    <LayoutGrid size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-8 w-8 rounded-md", viewMode === 'list' ? "bg-slate-800 text-white" : "text-slate-500")}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={16} />
                  </Button>
                </div>
              </div>
              
              <div className={cn(
                viewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-3"
              )}>
                {games.map((game, idx) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {viewMode === 'card' ? <GameCard {...game} /> : <GameListItem {...game} />}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Activity</h2>
              <ActivityHeatmap />
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Live Session</h2>
              <SessionTracker />
            </div>
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Updates</h2>
              <MatchHistory matches={recentMatches} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;