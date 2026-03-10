"use client";

import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, Gamepad2, Image as ImageIcon, Trophy, Clock, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AddGame = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Game added to your command center!");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-2xl mx-auto p-6 md:p-10">
        <Link to="/">
          <Button variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4">
            <ChevronLeft className="mr-2" size={20} />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">INITIALIZE NEW TRACKER</h1>
          <p className="text-slate-400 font-medium">Enter the combat parameters for your new objective.</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden">
          <div className="h-2 w-full bg-blue-600" />
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Gamepad2 className="text-blue-500" />
              GAME SPECIFICATIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Game Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Overwatch 2, League of Legends" 
                    className="bg-slate-950 border-slate-800 h-12 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rank" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Current Rank</Label>
                    <div className="relative">
                      <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <Input 
                        id="rank" 
                        placeholder="e.g. Platinum" 
                        className="bg-slate-950 border-slate-800 h-12 pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tier" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Tier / Division</Label>
                    <Input 
                      id="tier" 
                      placeholder="e.g. II" 
                      className="bg-slate-950 border-slate-800 h-12"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="peak" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Peak Rank (All Time)</Label>
                  <Input 
                    id="peak" 
                    placeholder="e.g. Diamond 1" 
                    className="bg-slate-950 border-slate-800 h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="winrate" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Win Rate (%)</Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <Input 
                        id="winrate" 
                        placeholder="50.0" 
                        className="bg-slate-950 border-slate-800 h-12 pl-10"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hours" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Hours Played</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <Input 
                        id="hours" 
                        placeholder="100" 
                        className="bg-slate-950 border-slate-800 h-12 pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Cover Image URL</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input 
                      id="image" 
                      placeholder="https://images.unsplash.com/..." 
                      className="bg-slate-950 border-slate-800 h-12 pl-10"
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 italic">Provide a direct link to a high-quality wallpaper or game art.</p>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-2xl text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                DEPLOY TRACKER
              </Button>
            </form>
          </CardContent>
        </Card>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
};

export default AddGame;