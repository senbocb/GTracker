"use client";

import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, Gamepad2, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const GAME_RANKS: Record<string, { ranks: string[], modes?: string[] }> = {
  "Valorant": { ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"] },
  "Counter-Strike 2": { ranks: [], modes: ["Premier", "Faceit"] },
  "Apex Legends": { ranks: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"] },
  "Overwatch 2": { ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"] },
  "League of Legends": { ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"] }
};

const AddGame = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  const handleGameChange = (val: string) => {
    setSelectedGame(val);
    setSelectedModes([]);
  };

  const toggleMode = (mode: string) => {
    setSelectedModes(prev => 
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    
    // Check if game already exists to merge
    const existingGameIndex = existingGames.findIndex((g: any) => g.title === selectedGame);
    
    const modesData = selectedModes.length > 0 ? selectedModes : ['Standard'];
    
    const newModes = modesData.map(mode => ({
      name: mode,
      rank: 'Unranked',
      tier: '',
      peakRank: 'Unranked',
      history: []
    }));

    if (existingGameIndex > -1) {
      // Merge modes
      const game = existingGames[existingGameIndex];
      const currentModeNames = game.modes.map((m: any) => m.name);
      const filteredNewModes = newModes.filter(m => !currentModeNames.includes(m.name));
      game.modes = [...game.modes, ...filteredNewModes];
      if (imageUrl) game.image = imageUrl;
    } else {
      existingGames.push({
        id: Date.now().toString(),
        title: selectedGame,
        image: imageUrl,
        modes: newModes,
        winRate: '0%',
        hoursPlayed: '0h'
      });
    }
    
    localStorage.setItem('combat_games', JSON.stringify(existingGames));
    showSuccess(`${selectedGame} tracker initialized.`);
    navigate('/');
  };

  const gameData = GAME_RANKS[selectedGame];

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
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">INITIALIZE TRACKER</h1>
          <p className="text-slate-400 font-medium">Select a game and the ranking systems you wish to monitor.</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden">
          <div className="h-2 w-full bg-blue-600" />
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Gamepad2 className="text-blue-500" />
              GAME CONFIG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Select Game</Label>
                  <Select onValueChange={handleGameChange} required>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-12">
                      <SelectValue placeholder="Choose a title..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {Object.keys(GAME_RANKS).map(game => (
                        <SelectItem key={game} value={game}>{game}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {gameData?.modes && (
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Ranking Systems</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {gameData.modes.map(mode => (
                        <div 
                          key={mode} 
                          onClick={() => toggleMode(mode)}
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedModes.includes(mode) 
                              ? 'bg-blue-600/10 border-blue-500 text-white' 
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          <Checkbox checked={selectedModes.includes(mode)} className="border-slate-700" />
                          <span className="font-bold uppercase text-xs tracking-wider">{mode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="image" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Cover Image URL (Optional)</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input 
                      id="image" 
                      placeholder="Direct image link" 
                      className="bg-slate-950 border-slate-800 h-12 pl-10"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={!selectedGame} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-2xl text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
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