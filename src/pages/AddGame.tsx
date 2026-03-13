"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Gamepad2, Image as ImageIcon, Plus, Info, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processImage } from '@/utils/imageProcessing';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const DEFAULT_REGISTRY = {
  "Valorant": { 
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"],
    modes: ["Competitive", "Premier"],
    image: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=1000&auto=format&fit=crop"
  },
  "Counter-Strike 2": { 
    ranks: ["Silver I", "Silver II", "Silver III", "Silver IV", "Silver Elite", "Silver Elite Master", "Gold Nova I", "Gold Nova II", "Gold Nova III", "Gold Nova Master", "Master Guardian I", "Master Guardian II", "Master Guardian Elite", "Distinguished Master Guardian", "Legendary Eagle", "Legendary Eagle Master", "Supreme Master First Class", "The Global Elite"],
    modes: ["Premier", "Competitive (Per Map)", "Wingman", "Faceit"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"
  },
  "League of Legends": {
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"],
    modes: ["Ranked Solo/Duo", "Ranked Flex"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"
  },
  "Overwatch 2": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Top 500"],
    modes: ["Role Queue", "Open Queue"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"
  },
  "Apex Legends": {
    ranks: ["Rookie", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Apex Predator"],
    modes: ["Battle Royale Ranked"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"
  },
  "Aim Lab": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"],
    modes: ["Ranked Season", "Benchmarks"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"
  },
  "Kovaaks": {
    ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Jade", "Master", "Grandmaster", "Nova", "Celestial"],
    modes: ["Voltaic Benchmarks", "rA Benchmarks"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"
  }
};

const AddGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registry, setRegistry] = useState<any>(DEFAULT_REGISTRY);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingGames, setExistingGames] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      supabase.from('games').select('*, game_modes(*)').eq('user_id', user.id).then(({ data }) => {
        if (data) setExistingGames(data);
      });
    }
  }, [user]);

  const gameOptions = Object.keys(registry);
  const modeOptions = useMemo(() => {
    if (!selectedGame || !registry[selectedGame]) return [];
    const allModes = registry[selectedGame].modes || [];
    
    // Filter out modes already tracked for this game
    const existingGame = existingGames.find(g => g.title === selectedGame);
    if (existingGame) {
      const existingModeNames = existingGame.game_modes.map((m: any) => m.name);
      return allModes.filter((m: string) => !existingModeNames.includes(m));
    }
    
    return allModes;
  }, [selectedGame, registry, existingGames]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame || selectedModes.length === 0 || !user) return;

    setLoading(true);
    try {
      // 1. Check if game already exists
      let gameId;
      const existingGame = existingGames.find(g => g.title === selectedGame);
      
      if (existingGame) {
        gameId = existingGame.id;
      } else {
        const { data: game, error: gameError } = await supabase
          .from('games')
          .insert({
            user_id: user.id,
            title: selectedGame,
            image: imageUrl || registry[selectedGame].image || ''
          })
          .select()
          .single();
        
        if (gameError) throw gameError;
        gameId = game.id;
      }

      // 2. Create modes
      const modesToInsert = selectedModes.map(name => ({
        game_id: gameId,
        name: name,
        rank: 'Unranked',
        peak_rank: 'Unranked'
      }));

      const { error: modesError } = await supabase
        .from('game_modes')
        .insert(modesToInsert);
      
      if (modesError) throw modesError;

      showSuccess(`${selectedGame} trackers initialized.`);
      navigate('/');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
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
          <div className="h-2 w-full bg-indigo-600" />
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Gamepad2 className="text-indigo-500" />
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
                        <SelectItem key={game} value={game}>{game}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {modeOptions.length > 0 ? (
                  <div className="grid gap-3 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-xs font-bold uppercase text-slate-300 tracking-widest">Select Modes (Multiple Allowed)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {modeOptions.map((mode: string) => (
                        <Button
                          key={mode}
                          type="button"
                          variant="outline"
                          onClick={() => toggleMode(mode)}
                          className={cn(
                            "h-12 justify-between px-4 border-slate-800 bg-slate-950 text-xs font-bold uppercase tracking-widest transition-all",
                            selectedModes.includes(mode) ? "border-indigo-500 bg-indigo-500/10 text-white" : "text-slate-500"
                          )}
                        >
                          {mode}
                          {selectedModes.includes(mode) && <Check size={14} className="text-indigo-500" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : selectedGame && (
                  <p className="text-xs text-slate-500 italic">All available modes for this game are already being tracked.</p>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="image" className="text-xs font-bold uppercase text-slate-300 tracking-widest">Override Cover Image</Label>
                  <div className="space-y-4">
                    <input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
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

              <Button type="submit" disabled={loading || !selectedGame || selectedModes.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-8 rounded-2xl text-lg shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Deploy Trackers"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddGame;