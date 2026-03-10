"use client";

import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, Gamepad2, Image as ImageIcon, Trophy, Link as LinkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AddGame = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    rank: '',
    tier: '',
    trackerLink: '',
    evxlLink: '',
    image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get existing games
    const existingGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    
    // Add new game with some default stats for the demo
    const newGame = {
      ...formData,
      id: Date.now(),
      peakRank: formData.rank,
      winRate: '50%',
      hoursPlayed: '0h'
    };
    
    const updatedGames = [...existingGames, newGame];
    localStorage.setItem('combat_games', JSON.stringify(updatedGames));
    
    showSuccess(`${formData.title} tracker initialized.`);
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
          <p className="text-slate-400 font-medium">Configure your combat parameters and external data links.</p>
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
                    placeholder="e.g. Valorant, CS2" 
                    className="bg-slate-950 border-slate-800 h-12 focus:ring-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                        placeholder="Rank Name" 
                        className="bg-slate-950 border-slate-800 h-12 pl-10"
                        value={formData.rank}
                        onChange={(e) => setFormData({...formData, rank: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tier" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Tier / Division</Label>
                    <Input 
                      id="tier" 
                      placeholder="e.g. III" 
                      className="bg-slate-950 border-slate-800 h-12"
                      value={formData.tier}
                      onChange={(e) => setFormData({...formData, tier: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tracker_link" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Tracker.gg Profile Link</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input 
                      id="tracker_link" 
                      placeholder="https://tracker.gg/valorant/profile/..." 
                      className="bg-slate-950 border-slate-800 h-12 pl-10"
                      value={formData.trackerLink}
                      onChange={(e) => setFormData({...formData, trackerLink: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="evxl_link" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Evxl.app Profile Link</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input 
                      id="evxl_link" 
                      placeholder="https://evxl.app/profile/..." 
                      className="bg-slate-950 border-slate-800 h-12 pl-10"
                      value={formData.evxlLink}
                      onChange={(e) => setFormData({...formData, evxlLink: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Cover Image URL</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input 
                      id="image" 
                      placeholder="Direct image link" 
                      className="bg-slate-950 border-slate-800 h-12 pl-10"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                    />
                  </div>
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