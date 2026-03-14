"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Gamepad2, Palette, List, Check, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AppLayout from '@/components/AppLayout';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";

const GameRegistry = () => {
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRegistry();
  }, []);

  const fetchRegistry = async () => {
    const { data, error } = await supabase.from('game_registry').select('*');
    if (error) showError(error.message);
    else setGames(data || []);
    setIsLoading(false);
  };

  const addGame = () => {
    const newGame = {
      title: 'New Game',
      image: '',
      ranks: ['Bronze', 'Silver', 'Gold'],
      rank_configs: {
        'Bronze': { color: '#cd7f32' },
        'Silver': { color: '#c0c0c0' },
        'Gold': { color: '#ffd700' }
      },
      modes: ['Ranked'],
      enable_rainbow: true
    };
    setGames([...games, newGame]);
  };

  const updateGame = (index: number, field: string, value: any) => {
    const updated = [...games];
    updated[index] = { ...updated[index], [field]: value };
    setGames(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const game of games) {
        const { error } = await supabase
          .from('game_registry')
          .upsert({
            id: game.id,
            title: game.title,
            image: game.image,
            ranks: game.ranks,
            rank_configs: game.rank_configs,
            modes: game.modes,
            enable_rainbow: game.enable_rainbow
          });
        if (error) throw error;
      }
      showSuccess("Registry updated successfully.");
      fetchRegistry();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <AppLayout><div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-indigo-500" /></div></AppLayout>;

  return (
    <AppLayout>
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Game Registry</h1>
            <p className="text-slate-400 text-sm">Define custom games, ranks, and visual styles.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addGame} className="border-slate-800 bg-slate-900/50"><Plus size={16} className="mr-2" /> Add Game</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500">
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {games.map((game, idx) => (
            <Card key={idx} className="bg-slate-900/50 border-slate-800 overflow-hidden">
              <CardHeader className="border-b border-slate-800 bg-slate-950/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Gamepad2 className="text-indigo-500" />
                    <Input 
                      value={game.title} 
                      onChange={(e) => updateGame(idx, 'title', e.target.value)}
                      className="bg-transparent border-none text-xl font-black uppercase italic p-0 h-auto focus-visible:ring-0 w-64"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10" onClick={() => setGames(games.filter((_, i) => i !== idx))}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Banner Image URL</Label>
                    <Input value={game.image} onChange={(e) => updateGame(idx, 'image', e.target.value)} className="bg-slate-950 border-slate-800" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Game Modes (Comma separated)</Label>
                    <Input 
                      value={game.modes.join(', ')} 
                      onChange={(e) => updateGame(idx, 'modes', e.target.value.split(',').map((s: string) => s.trim()))} 
                      className="bg-slate-950 border-slate-800" 
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold">Rainbow Peak Rank</Label>
                      <p className="text-[10px] text-slate-500">Enable animated gradient for the highest rank.</p>
                    </div>
                    <Switch checked={game.enable_rainbow} onCheckedChange={(v) => updateGame(idx, 'enable_rainbow', v)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2"><Palette size={14} /> Rank Hierarchy & Colors</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {game.ranks.map((rank: string, rIdx: number) => (
                      <div key={rIdx} className="flex items-center gap-2">
                        <Input 
                          value={rank} 
                          onChange={(e) => {
                            const newRanks = [...game.ranks];
                            newRanks[rIdx] = e.target.value;
                            updateGame(idx, 'ranks', newRanks);
                          }}
                          className="bg-slate-950 border-slate-800 text-xs h-8"
                        />
                        <Input 
                          type="color" 
                          value={game.rank_configs?.[rank]?.color || '#ffffff'} 
                          onChange={(e) => {
                            const newConfigs = { ...game.rank_configs };
                            newConfigs[rank] = { color: e.target.value };
                            updateGame(idx, 'rank_configs', newConfigs);
                          }}
                          className="w-12 h-8 p-1 bg-slate-950 border-slate-800"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => {
                          const newRanks = game.ranks.filter((_: any, i: number) => i !== rIdx);
                          updateGame(idx, 'ranks', newRanks);
                        }}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full border-dashed border-slate-800 text-[10px] uppercase font-bold" onClick={() => {
                      updateGame(idx, 'ranks', [...game.ranks, 'New Rank']);
                    }}>
                      <Plus size={12} className="mr-1" /> Add Rank
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </AppLayout>
  );
};

export default GameRegistry;