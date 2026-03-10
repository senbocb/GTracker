"use client";

import React, { useState, useEffect } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, Gamepad2, Image as ImageIcon, Trophy, Link as LinkIcon, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GAME_RANKS: Record<string, { ranks: string[], modes?: string[] }> = {
  "Valorant": {
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"]
  },
  "Counter-Strike 2": {
    ranks: [], // Handled by mode
    modes: ["Premier", "Faceit"]
  },
  "Apex Legends": {
    ranks: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"]
  },
  "Overwatch 2": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"]
  },
  "League of Legends": {
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"]
  }
};

const FACEIT_LEVELS = Array.from({ length: 10 }, (_, i) => `Level ${i + 1}`);
const TIERS = ["I", "II", "III"];

const AddGame = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    mode: '',
    rank: '',
    tier: '',
    trackerLink: '',
    image: ''
  });

  const handleGameChange = (val: string) => {
    setFormData({ ...formData, title: val, mode: '', rank: '', tier: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    
    const initialHistory = [{
      id: Date.now().toString(),
      rank: formData.rank,
      tier: formData.tier,
      mode: formData.mode,
      timestamp: new Date().toISOString(),
      numericValue: formData.mode === 'Premier' ? parseInt(formData.rank) || 0 : 0 // Simplified for now
    }];

    const newGame = {
      ...formData,
      id: Date.now().toString(),
      peakRank: formData.rank,
      winRate: '50%',
      hoursPlayed: '0h',
      history: initialHistory
    };
    
    localStorage.setItem('combat_games', JSON.stringify([...existingGames, newGame]));
    showSuccess(`${formData.title} tracker initialized.`);
    navigate('/');
  };

  const selectedGameData = GAME_RANKS[formData.title];

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
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Game Title</Label>
                  <Select onValueChange={handleGameChange} required>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-12">
                      <SelectValue placeholder="Select Game" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {Object.keys(GAME_RANKS).map(game => (
                        <SelectItem key={game} value={game}>{game}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGameData?.modes && (
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Ranking System</Label>
                    <Select onValueChange={(v) => setFormData({...formData, mode: v, rank: '', tier: ''})} required>
                      <SelectTrigger className="bg-slate-950 border-slate-800 h-12">
                        <SelectValue placeholder="Select Mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {selectedGameData.modes.map(mode => (
                          <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Current Rank</Label>
                    {formData.mode === 'Premier' ? (
                      <Input 
                        type="number" 
                        placeholder="e.g. 15000" 
                        className="bg-slate-950 border-slate-800 h-12"
                        value={formData.rank}
                        onChange={(e) => setFormData({...formData, rank: e.target.value})}
                        required
                      />
                    ) : (
                      <Select 
                        onValueChange={(v) => setFormData({...formData, rank: v})} 
                        value={formData.rank}
                        required
                        disabled={!formData.title || (selectedGameData?.modes && !formData.mode)}
                      >
                        <SelectTrigger className="bg-slate-950 border-slate-800 h-12">
                          <SelectValue placeholder="Select Rank" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {formData.mode === 'Faceit' ? (
                            FACEIT_LEVELS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                          ) : (
                            selectedGameData?.ranks.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Tier / Division</Label>
                    <Select 
                      onValueChange={(v) => setFormData({...formData, tier: v})}
                      disabled={formData.mode === 'Premier' || formData.mode === 'Faceit' || !formData.rank}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 h-12">
                        <SelectValue placeholder="Select Tier" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {TIERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
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