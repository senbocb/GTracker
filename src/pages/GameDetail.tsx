"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, ExternalLink, Trash2, Target, Zap, Trophy, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RankBadge from '@/components/RankBadge';
import ProgressChart from '@/components/ProgressChart';
import { showSuccess } from '@/utils/toast';

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const found = savedGames.find((g: any) => g.id === id);
    if (found) setGame(found);
    else navigate('/');
  }, [id, navigate]);

  const handleDelete = () => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const filtered = savedGames.filter((g: any) => g.id !== id);
    localStorage.setItem('combat_games', JSON.stringify(filtered));
    showSuccess(`${game.title} tracker decommissioned.`);
    navigate('/');
  };

  if (!game) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white -ml-4">
              <ChevronLeft className="mr-2" size={20} />
              Back to Dashboard
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={handleDelete}>
            <Trash2 size={16} className="mr-2" /> Decommission Tracker
          </Button>
        </div>

        <div className="relative h-64 rounded-3xl overflow-hidden border border-slate-800 mb-10">
          {game.image ? (
            <img src={game.image} alt={game.title} className="w-full h-full object-cover opacity-50" />
          ) : (
            <div className="w-full h-full bg-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
          <div className="absolute bottom-8 left-8">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-4">{game.title}</h1>
            <div className="flex items-center gap-4">
              <RankBadge rank={game.rank} tier={game.tier} className="scale-110" />
              {game.trackerLink && (
                <a href={game.trackerLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900/50">
                    <ExternalLink size={14} className="mr-2" /> Tracker.gg
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="text-blue-500" size={20} />
                  PERFORMANCE TREND
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart data={[]} />
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="text-blue-500" size={20} />
                  RECENT ACTIVITY
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No recent matches logged for this game</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Combat Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase">Peak Rank</span>
                  <span className="font-black text-white">{game.peakRank || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase">Win Rate</span>
                  <span className="font-black text-emerald-400">{game.winRate || '0%'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase">Playtime</span>
                  <span className="font-black text-blue-400">{game.hoursPlayed || '0h'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
};

export default GameDetail;