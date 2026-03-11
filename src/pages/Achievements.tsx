"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Trophy, Search, Filter, Award, Shield, Star, User, Calendar, Medal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const Achievements = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [profile, setProfile] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('combat_profile') || 'null');
    setProfile(savedProfile);
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    setGames(savedGames);
    const savedFavs = JSON.parse(localStorage.getItem('combat_achievement_favs') || '[]');
    setFavorites(savedFavs);
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('combat_achievement_favs', JSON.stringify(newFavs));
    showSuccess(favorites.includes(id) ? "Medal unpinned." : "Medal pinned to top.");
  };

  const level = Math.floor((profile?.xp || 0) / 100) + 1;

  const allAchievements = useMemo(() => {
    const base = [
      { id: 'recruit', label: 'Recruit', icon: <User size={24} />, minLevel: 1, color: 'text-slate-300', category: 'Service' },
      { id: 'veteran', label: 'Veteran', icon: <Shield size={24} />, minLevel: 5, color: 'text-blue-400', category: 'Service' },
      { id: 'elite', label: 'Elite', icon: <Star size={24} />, minLevel: 10, color: 'text-indigo-400', category: 'Service' },
      { id: 'legend', label: 'Legend', icon: <Trophy size={24} />, minLevel: 20, color: 'text-yellow-400', category: 'Service' },
    ];

    const gameAchievements = games.flatMap(game => 
      game.modes.filter((m: any) => {
        const r = m.peakRank?.toLowerCase() || "";
        return r === 'radiant' || r === 'top 500' || r === 'challenger' || r === 'apex predator';
      }).map((m: any) => ({
        id: `master_${game.id}_${m.name}`,
        label: `${game.title} Master`,
        icon: <Medal size={24} />,
        unlocked: true,
        color: 'text-indigo-400 rainbow-gradient',
        category: 'Combat',
        date: 'Peak Achieved'
      }))
    );

    return [...base, ...gameAchievements];
  }, [games]);

  const filtered = allAchievements
    .filter(a => a.label.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Favorites always first
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      if (sortBy === 'newest') return -1;
      if (sortBy === 'oldest') return 1;
      return 0;
    });

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4">
            <Award className="text-yellow-500" size={36} />
            Hall of Fame
          </h1>
          <p className="text-slate-400 font-medium">Comprehensive record of all service medals and combat achievements.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <Input 
              placeholder="Search medals..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border-slate-800 pl-10 h-12"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 bg-slate-900 border-slate-800 h-12">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="rarity">By Rarity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((medal: any) => {
            const isUnlocked = medal.unlocked || level >= medal.minLevel;
            const isFav = favorites.includes(medal.id);
            return (
              <div key={medal.id} className={cn(
                "p-6 rounded-3xl border flex flex-col items-center text-center gap-4 transition-all backdrop-blur-sm relative overflow-hidden group",
                isUnlocked ? "bg-slate-900/90 border-slate-800" : "bg-slate-950/40 border-slate-900 opacity-40 grayscale",
                isFav && "border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
              )}>
                {isUnlocked && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />}
                
                <button 
                  onClick={() => toggleFavorite(medal.id)}
                  className={cn(
                    "absolute top-4 right-4 transition-all hover:scale-125",
                    isFav ? "text-yellow-500" : "text-slate-600 hover:text-slate-400"
                  )}
                >
                  <Star size={18} fill={isFav ? "currentColor" : "none"} />
                </button>

                <div className={cn(
                  "w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110",
                  isUnlocked ? medal.color : "text-slate-700"
                )}>
                  {medal.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{medal.category}</p>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">{medal.label}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                    {isUnlocked ? (medal.date || 'Unlocked') : `Requires Level ${medal.minLevel}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </AppLayout>
  );
};

export default Achievements;