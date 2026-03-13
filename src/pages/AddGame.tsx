"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Gamepad2, Image as ImageIcon, Plus, Info, ChevronLeft, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processImage } from '@/utils/imageProcessing';
import { cn } from '@/lib/utils';

const DEFAULT_REGISTRY = {
  "Valorant": { 
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"],
    modes: ["Competitive", "Premier"]
  },
  "Counter-Strike 2": { 
    ranks: ["Silver I", "Silver II", "Silver III", "Silver IV", "Silver Elite", "Silver Elite Master", "Gold Nova I", "Gold Nova II", "Gold Nova III", "Gold Nova Master", "Master Guardian I", "Master Guardian II", "Master Guardian Elite", "Distinguished Master Guardian", "Legendary Eagle", "Legendary Eagle Master", "Supreme Master First Class", "The Global Elite"],
    modes: ["Premier", "Competitive (Per Map)", "Wingman", "Faceit"]
  },
  "Overwatch 2": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"],
    modes: ["Tank", "Damage", "Support", "Open Queue"]
  },
  "League of Legends": {
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"],
    modes: ["Ranked Solo/Duo", "Ranked Flex"]
  },
  "Apex Legends": {
    ranks: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"],
    modes: ["Battle Royale", "Arenas"]
  },
  "Rainbow Six Siege": {
    ranks: ["Copper", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Champion"],
    modes: ["Ranked"]
  },
  "The Finals": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ruby"],
    modes: ["World Tour", "Ranked Tournament"]
  },
  "Marvel Rivals": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Grandmaster", "Celestial", "Eternity"],
    modes: ["Competitive"]
  },
  "Aim Lab": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"],
    modes: ["Ranked", "Voltaic Benchmarks"]
  },
  "Kovaaks": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Nova", "Astra", "Celestial"],
    modes: ["Voltaic Benchmarks", "EVXL Benchmarks"]
  }
};

const AddGame = () => {
  const navigate = useNavigate();
  const [registry, setRegistry] = useState<any>({});
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_game_registry') || 'null');
    if (saved && Object.keys(saved).length > 0) {
      setRegistry(saved);
    } else {
      localStorage.setItem('combat_game_registry', JSON.stringify(DEFAULT_REGISTRY));
      setRegistry(DEFAULT_REGISTRY);
    }
  }, []);

  const gameOptions = Object.keys(registry);
  const modeOptions = useMemo(() => {
    if (!selectedGame || !registry[selectedGame]) return [];
    return registry[selectedGame].modes || [];
  }, [selectedGame, registry]);

  const toggleMode = (mode: string) => {
    setSelectedModes(prev => 
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

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
    if (!selectedGame || selectedModes.length === 0) return;

    const gameDef = registry[selectedGame] || { image: '', modes: [] };
    const existingGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const existingGameIndex = existingGames.findIndex((g: any) => g.title === selectedGame);
    
    const newModes = selectedModes.map(modeName => ({
      name: modeName,
      rank: 'Unranked',
      tier: '',
      peakRank: 'Unranked',
      history: []
    }));

    if (existingGameIndex > -1) {
      const game = existingGames[existingGameIndex];
      newModes.forEach(newMode => {
        if (!game.modes.some((m: any) => m.name === newMode.name)) {
          game.modes.push(newMode);
        }
      });
      if (imageUrl) game.image = imageUrl;
    } else {
      existingGames.push({
        id: Date.now().toString(),
        title: selectedGame,
        image: imageUrl || gameDef.image || '',
        modes: newModes,
        winRate: '0%',
        hoursPlayed: '0h'
      });
    }
    
    localStorage.setItem('combat_games', JSON.stringify(existingGames));
    showSuccess(`${selectedGame} (${selectedModes.join(', ')}) tracker initialized.`);
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
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">Initialize Tracker</h1>
          <p className="text-slate-400 font-medium">Select your operation environment and modes.</p>
        </div>

        <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
          <div className="h-2 w-full bg-blue-600" />
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Gamepad2 className="text-blue-500" />
              Deployment Config
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-300 tracking-widest">Select Game</Label>
                  <Select onValueChange={(v) => { setSelectedGame(v); setSelectedModes([]); }} required>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-14 text-base text-white">
                      <SelectValue placeholder="Choose an operation..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {gameOptions.map(game => (
                        <SelectItem key={game} value={game} className="py-3 focus:bg-blue-600 focus:text-white">{game}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {modeOptions.length > 0 && (
                  <div className="grid gap-3 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-xs font-bold uppercase text-slate-300 tracking-widest">Select Modes (Multiple Allowed)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {modeOptions.map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => toggleMode(mode)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                            selectedModes.includes(mode) 
                              ? "bg-indigo-600/20 border-indigo-500 text-white" 
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          )}
                        >
                          <span className="text-xs font-black uppercase tracking-tight">{mode}</span>
                          {selectedModes.includes(mode) && <Check size={16} className="text-indigo-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="image" className="text-xs font-bold uppercase text-slate-300 tracking-widest">Override Cover Image</Label>
                  <div className="space-y-4">
                    <input 
                      id="image" 
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full border-dashed border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white h-12"
                      onClick={() => document.getElementById('image')?.click()}
                    >
                      <ImageIcon size={16} className="mr-2" />
                      {imageUrl ? 'Change Image' : 'Upload Cover Image'}
                    </Button>
                    {imageUrl && (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={!selectedGame || selectedModes.length === 0} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-2xl text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Deploy Tracker
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddGame;