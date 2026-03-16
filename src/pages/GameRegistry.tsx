"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Gamepad2, ImageIcon, List, Check, Loader2, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AppLayout from '@/components/AppLayout';
import RankBadge from '@/components/RankBadge';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_GAMES = [
  {
    title: 'Valorant',
    image: 'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=1000&auto=format&fit=crop',
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"],
    rank_configs: {
      'Iron': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/3.png' },
      'Bronze': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/6.png' },
      'Silver': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/9.png' },
      'Gold': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/12.png' },
      'Platinum': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/15.png' },
      'Diamond': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/18.png' },
      'Ascendant': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/21.png' },
      'Immortal': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/24.png' },
      'Radiant': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/27.png' }
    },
    modes: ['Competitive'],
    enable_rainbow: true
  },
  {
    title: 'Counter-Strike 2',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
    ranks: [
      "Silver I", "Silver II", "Silver III", "Silver IV", "Silver Elite", "Silver Elite Master", 
      "Gold Nova I", "Gold Nova II", "Gold Nova III", "Gold Nova Master", 
      "Master Guardian I", "Master Guardian II", "Master Guardian Elite", "Distinguished Master Guardian", 
      "Legendary Eagle", "Legendary Eagle Master", "Supreme Master First Class", "The Global Elite",
      "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9", "Level 10"
    ],
    rank_configs: {
      'Silver I': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/1.png' },
      'Silver II': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/2.png' },
      'Silver III': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/3.png' },
      'Silver IV': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/4.png' },
      'Silver Elite': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/5.png' },
      'Silver Elite Master': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/6.png' },
      'Gold Nova I': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/7.png' },
      'Gold Nova II': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/8.png' },
      'Gold Nova III': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/9.png' },
      'Gold Nova Master': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/10.png' },
      'Master Guardian I': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/11.png' },
      'Master Guardian II': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/12.png' },
      'Master Guardian Elite': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/13.png' },
      'Distinguished Master Guardian': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/14.png' },
      'Legendary Eagle': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/15.png' },
      'Legendary Eagle Master': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/16.png' },
      'Supreme Master First Class': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/17.png' },
      'The Global Elite': { icon_url: 'https://raw.githubusercontent.com/ItzArty/csgo-rank-icons/master/png/18.png' },
      'Level 1': { icon_url: 'https://raw.githubusercontent.com/p0melo/faceit-icons/master/png/1.png' },
      'Level 2': { icon_url: 'https://raw.githubusercontent.com/p0melo/faceit-icons/master/png/2.png' },
      'Level 3': { icon_url: 'https://raw.githubusercontent.com/p0melo/faceit-icons/master/png/3.png' },
      'Level 4': { icon_url: 'https://raw.githubusercontent.com/p0melo/faceit-icons/master/png/4.png' },
      'Level 5': { icon_url: 'https://raw.githubusercontent.com/p0melo/faceit-icons/master/png/5.png' },
      'Level 6': { icon_url: 'https://raw.githubusercontent.com/p0melo/faceit-icons/master/png/6.png' },
      'Level 7': { icon_url: 'https://raw.githubusercontent.com/p0melo/faceit-icons/master/png/7.png' },
      'Level 8': { icon_url: 'https://raw.githubusercontent.com/p0melo/faceit-icons/master/png/8.png' },
      'Level 9': { icon_url: 'https://raw.githubusercontent.com/p0melo/faceit-icons/master/png/9.png' },
      'Level 10': { icon_url: 'https://raw.githubusercontent.com/p0melo/faceit-icons/master/png/10.png' }
    },
    modes: ['Premier', 'Competitive', 'Wingman', 'Faceit'],
    enable_rainbow: true
  },
  {
    title: 'League of Legends',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"],
    rank_configs: {
      'Iron': { icon_url: 'https://static.wikia.nocookie.net/leagueoflegends/images/0/03/Season_2023_-_Iron.png' },
      'Bronze': { icon_url: 'https://static.wikia.nocookie.net/leagueoflegends/images/f/f4/Season_2023_-_Bronze.png' },
      'Silver': { icon_url: 'https://static.wikia.nocookie.net/leagueoflegends/images/7/70/Season_2023_-_Silver.png' },
      'Gold': { icon_url: 'https://static.wikia.nocookie.net/leagueoflegends/images/8/8d/Season_2023_-_Gold.png' },
      'Platinum': { icon_url: 'https://static.wikia.nocookie.net/leagueoflegends/images/b/b9/Season_2023_-_Platinum.png' },
      'Emerald': { icon_url: 'https://static.wikia.nocookie.net/leagueoflegends/images/a/ac/Season_2023_-_Emerald.png' },
      'Diamond': { icon_url: 'https://static.wikia.nocookie.net/leagueoflegends/images/9/91/Season_2023_-_Diamond.png' },
      'Master': { icon_url: 'https://static.wikia.nocookie.net/leagueoflegends/images/1/11/Season_2023_-_Master.png' },
      'Grandmaster': { icon_url: 'https://static.wikia.nocookie.net/leagueoflegends/images/7/76/Season_2023_-_Grandmaster.png' },
      'Challenger': { icon_url: 'https://static.wikia.nocookie.net/leagueoflegends/images/5/5f/Season_2023_-_Challenger.png' }
    },
    modes: ['Ranked Solo/Duo', 'Ranked Flex'],
    enable_rainbow: true
  }
];

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

  const seedDefaults = () => {
    setGames([...games, ...DEFAULT_GAMES.filter(dg => !games.some(g => g.title === dg.title))]);
    showSuccess("Default games added to list. Save to confirm.");
  };

  const addGame = () => {
    const newGame = {
      title: 'New Game',
      image: '',
      ranks: ['Bronze', 'Silver', 'Gold'],
      rank_configs: {
        'Bronze': { icon_url: '' },
        'Silver': { icon_url: '' },
        'Gold': { icon_url: '' }
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Game Registry</h1>
            <p className="text-slate-400 text-sm">Define custom games, ranks, and visual styles.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={seedDefaults} className="border-slate-800 bg-slate-900/50">
              <RefreshCw size={16} className="mr-2" /> Seed Defaults
            </Button>
            <Button variant="outline" onClick={addGame} className="border-slate-800 bg-slate-900/50">
              <Plus size={16} className="mr-2" /> Add Game
            </Button>
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
                  <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2"><ImageIcon size={14} /> Rank Hierarchy & Icons</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {game.ranks.map((rank: string, rIdx: number) => (
                      <div key={rIdx} className="flex items-center gap-2">
                        <RankBadge rank={rank} gameTitle={game.title} className="scale-75 shrink-0" />
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
                          placeholder="Icon PNG URL"
                          value={game.rank_configs?.[rank]?.icon_url || ''} 
                          onChange={(e) => {
                            const newConfigs = { ...game.rank_configs };
                            newConfigs[rank] = { ...newConfigs[rank], icon_url: e.target.value };
                            updateGame(idx, 'rank_configs', newConfigs);
                          }}
                          className="bg-slate-950 border-slate-800 text-[10px] h-8"
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