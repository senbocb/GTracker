"use client";

import React, { useState, useMemo } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Gamepad2, Image as ImageIcon, Plus, Info, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processImage } from '@/utils/imageProcessing';

const GAME_CONFIGS: Record<string, { ranks: string[], modes?: string[] }> = {
  "Valorant": { ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"] },
  "Counter-Strike 2": { ranks: [], modes: ["Premier", "Faceit"] },
  "Apex Legends": { ranks: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"] },
  "Overwatch 2": { 
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"],
    modes: ["Tank", "Damage", "Support"]
  },
  "League of Legends": { ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"] }
};

const AddGame = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const gameOptions = Object.keys(GAME_CONFIGS);
  const modeOptions = useMemo(() => {
    if (!selectedGame) return [];
    return GAME_CONFIGS[selectedGame].modes || [];
  }, [selectedGame]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImage(file, 800, 450, 0.7);
        setImageUrl(processed);
        showSuccess("Cover image processed.");
      } catch (err) {
        showError("Failed to process image.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;

    const finalModeName = selectedMode || 'Standard';
    
    const existingGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const existingGameIndex = existingGames.findIndex((g: any) => g.title === selectedGame);
    
    const newMode = {
      name: finalModeName,
      rank: 'Unranked',
      tier: '',
      peakRank: 'Unranked',
      history: []
    };

    if (existingGameIndex > -1) {
      const game = existingGames[existingGameIndex];
      const modeExists = game.modes.some((m: any) => m.name === finalModeName);
      
      if (!modeExists) {
        game.modes.push(newMode);
      }
      if (imageUrl) game.image = imageUrl;
    } else {
      existingGames.push({
        id: Date.now().toString(),
        title: selectedGame,
        image: imageUrl,
        modes: [newMode],
        winRate: '0%',
        hoursPlayed: '0h'
      });
    }
    
    localStorage.setItem('combat_games', JSON.stringify(existingGames));
    showSuccess(`${selectedGame} (${finalModeName}) tracker initialized.`);
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
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">INITIALIZE TRACKER</h1>
          <p className="text-slate-400 font-medium">Select your combat environment from the unified deployment list.</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden">
          <div className="h-2 w-full bg-blue-600" />
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Gamepad2 className="text-blue-500" />
              DEPLOYMENT CONFIG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Select Game</Label>
                  <Select onValueChange={(v) => { setSelectedGame(v); setSelectedMode(''); }} required>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-14 text-base">
                      <SelectValue placeholder="Choose an operation..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {gameOptions.map(game => (
                        <SelectItem key={game} value={game} className="py-3">{game}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {modeOptions.length > 0 && (
                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Select Mode</Label>
                    <Select onValueChange={setSelectedMode} required>
                      <SelectTrigger className="bg-slate-950 border-slate-800 h-14 text-base">
                        <SelectValue placeholder="Choose a mode..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {modeOptions.map(mode => (
                          <SelectItem key={mode} value={mode} className="py-3">{mode}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="image" className="text-xs font-bold uppercase text-slate-500 tracking-widest">Cover Image</Label>
                  <div className="space-y-4">
                    <Input 
                      id="image" 
                      type="file"
                      accept="image/*"
                      className="bg-slate-950 border-slate-800 h-12"
                      onChange={handleImageUpload}
                    />
                    {imageUrl && (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={!selectedGame || (modeOptions.length > 0 && !selectedMode)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-2xl text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
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