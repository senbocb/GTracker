"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, Trash2, Save, Gamepad2, ImageIcon, List, Check, 
  Loader2, RefreshCw, ChevronLeft, Settings2, Upload, Layers, Lock,
  GripVertical, ImagePlus, FileImage
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AppLayout from '@/components/AppLayout';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";
import { processImage } from '@/utils/imageProcessing';
import { cn } from '@/lib/utils';
import { useAuth } from "@/components/AuthProvider";

const DEFAULT_GAMES = [
  {
    title: 'Valorant',
    image: 'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=1000&auto=format&fit=crop',
    modes: [
      {
        name: 'Competitive',
        ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"],
        rank_configs: {
          'Iron': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/3.png' },
          'Radiant': { icon_url: 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/27.png' }
        }
      }
    ],
    enable_rainbow: true
  },
  {
    title: 'Counter-Strike 2',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
    modes: [
      {
        name: 'Premier',
        ranks: ["0-4999", "5000-9999", "10000-14999", "15000-19999", "20000-24999", "25000-29999", "30000+"],
        rank_configs: {}
      },
      {
        name: 'Faceit',
        ranks: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Level 9", "Level 10", "Challenger"],
        rank_configs: {
          'Level 1': { icon_url: '/src/assets/ranks/faceit/1.svg' },
          'Level 10': { icon_url: '/src/assets/ranks/faceit/10.svg' },
          'Challenger': { icon_url: '/src/assets/ranks/faceit/11.svg' }
        }
      }
    ],
    enable_rainbow: true
  },
  {
    title: 'League of Legends',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
    modes: [
      { name: 'Ranked Solo/Duo', ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"], rank_configs: {} }
    ],
    enable_rainbow: true
  }
];

const GameRegistry = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeGameIdx, setActiveGameIdx] = useState<number | null>(null);
  const [activeModeName, setActiveModeName] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rankIconInputRef = useRef<{idx: number, rank: string} | null>(null);

  const isOwner = user?.email === "mizur@dyad.sh"; 

  useEffect(() => {
    fetchRegistry();
  }, []);

  const fetchRegistry = async () => {
    const { data, error } = await supabase.from('game_registry').select('*');
    if (error) showError(error.message);
    else {
      const formatted = (data || []).map(g => ({
        ...g,
        modes: Array.isArray(g.modes) ? g.modes.map((m: any) => ({
          ...m,
          ranks: m.ranks || [],
          rank_configs: m.rank_configs || {}
        })) : [{ name: 'Default', ranks: g.ranks || [], rank_configs: g.rank_configs || {} }]
      }));
      setGames(formatted);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!isOwner) return;
    setIsSaving(true);
    try {
      for (const game of games) {
        const { error } = await supabase
          .from('game_registry')
          .upsert({
            id: game.id,
            title: game.title,
            image: game.image,
            modes: game.modes,
            enable_rainbow: game.enable_rainbow
          });
        if (error) throw error;
      }
      showSuccess("Registry synchronized with database.");
      fetchRegistry();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (!isOwner || activeGameIdx === null) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    const updatedGames = [...games];
    const game = updatedGames[activeGameIdx];
    const modeIdx = game.modes.findIndex((m: any) => m.name === activeModeName);
    
    if (modeIdx === -1) return;

    const mode = game.modes[modeIdx];
    
    for (const file of imageFiles) {
      try {
        const processed = await processImage(file, 128, 128, 0.8);
        const rankName = file.name.split('.')[0].replace(/[-_]/g, ' ');
        
        // Add new rank
        mode.ranks.push(rankName);
        mode.rank_configs[rankName] = { icon_url: processed };
      } catch (err) {
        console.error("Failed to process dropped image", err);
      }
    }

    setGames(updatedGames);
    showSuccess(`Imported ${imageFiles.length} ranks. Sync to save.`);
  }, [isOwner, activeGameIdx, activeModeName, games]);

  const updateGame = (index: number, field: string, value: any) => {
    if (!isOwner) return;
    const updated = [...games];
    updated[index] = { ...updated[index], [field]: value };
    setGames(updated);
  };

  if (isLoading) return <AppLayout><div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-indigo-500" /></div></AppLayout>;

  if (activeGameIdx !== null) {
    const game = games[activeGameIdx];
    const currentMode = game.modes.find((m: any) => m.name === activeModeName) || game.modes[0];

    return (
      <AppLayout>
        <main className="max-w-5xl mx-auto p-6 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => setActiveGameIdx(null)} className="text-slate-400 hover:text-white -ml-4">
              <ChevronLeft className="mr-2" /> Back to Registry
            </Button>
            {isOwner && (
              <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 font-black uppercase tracking-widest">
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Sync Registry
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
                <div className="h-32 relative">
                  {game.image ? <img src={game.image} className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full bg-slate-800" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Operation Title</Label>
                    <Input value={game.title} onChange={(e) => updateGame(activeGameIdx, 'title', e.target.value)} className="bg-slate-950 border-slate-800 font-black uppercase italic" disabled={!isOwner} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <Label className="text-xs font-bold">Rainbow Peak</Label>
                    <Switch checked={game.enable_rainbow} onCheckedChange={(v) => updateGame(activeGameIdx, 'enable_rainbow', v)} disabled={!isOwner} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader><CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Active Modes</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {game.modes.map((mode: any, mIdx: number) => (
                    <Button 
                      key={mIdx}
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start text-[10px] font-black uppercase tracking-widest h-10",
                        activeModeName === mode.name ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"
                      )}
                      onClick={() => setActiveModeName(mode.name)}
                    >
                      <Layers size={14} className="mr-2" /> {mode.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={onDrop}
                className={cn(
                  "min-h-[600px] rounded-3xl border-2 border-dashed transition-all p-6 space-y-4",
                  isDraggingOver ? "border-indigo-500 bg-indigo-500/5 scale-[0.99]" : "border-slate-800 bg-slate-900/20"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                    <List size={16} /> {activeModeName} Hierarchy
                  </h2>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Drag PNGs here to bulk import</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentMode?.ranks.map((rank: string, rIdx: number) => (
                    <div key={rIdx} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 group">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                        {currentMode.rank_configs[rank]?.icon_url ? (
                          <img src={currentMode.rank_configs[rank].icon_url} className="w-full h-full object-contain p-1" />
                        ) : (
                          <FileImage size={16} className="text-slate-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input 
                          value={rank} 
                          onChange={(e) => {
                            if (!isOwner) return;
                            const updatedGames = [...games];
                            const mIdx = updatedGames[activeGameIdx].modes.findIndex((m: any) => m.name === activeModeName);
                            const oldRank = updatedGames[activeGameIdx].modes[mIdx].ranks[rIdx];
                            updatedGames[activeGameIdx].modes[mIdx].ranks[rIdx] = e.target.value;
                            const config = updatedGames[activeGameIdx].modes[mIdx].rank_configs[oldRank];
                            delete updatedGames[activeGameIdx].modes[mIdx].rank_configs[oldRank];
                            updatedGames[activeGameIdx].modes[mIdx].rank_configs[e.target.value] = config;
                            setGames(updatedGames);
                          }}
                          className="bg-transparent border-none text-sm font-black uppercase italic p-0 h-auto focus-visible:ring-0"
                          disabled={!isOwner}
                        />
                      </div>
                      {isOwner && (
                        <Button variant="ghost" size="icon" className="text-slate-600 hover:text-red-500" onClick={() => {
                          const updatedGames = [...games];
                          const mIdx = updatedGames[activeGameIdx].modes.findIndex((m: any) => m.name === activeModeName);
                          updatedGames[activeGameIdx].modes[mIdx].ranks = updatedGames[activeGameIdx].modes[mIdx].ranks.filter((_: any, i: number) => i !== rIdx);
                          setGames(updatedGames);
                        }}>
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  {isOwner && (
                    <Button variant="outline" className="w-full border-dashed border-slate-800 h-16 text-[10px] font-black uppercase" onClick={() => {
                      const updatedGames = [...games];
                      const mIdx = updatedGames[activeGameIdx].modes.findIndex((m: any) => m.name === activeModeName);
                      updatedGames[activeGameIdx].modes[mIdx].ranks.push('New Rank');
                      setGames(updatedGames);
                    }}>
                      <Plus size={14} className="mr-2" /> Add Rank Manually
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Game Registry</h1>
            <p className="text-slate-400 font-medium">Centralized command for operation environments and rank hierarchies.</p>
          </div>
          {isOwner && (
            <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 text-[10px] font-black uppercase tracking-widest h-12 px-8">
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />} Sync Registry
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, idx) => (
            <Card 
              key={idx} 
              className="bg-slate-900/50 border-slate-800 group hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden"
              onClick={() => { setActiveGameIdx(idx); setActiveModeName(game.modes[0]?.name || ''); }}
            >
              <div className="h-32 relative">
                {game.image ? <img src={game.image} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full bg-slate-800" />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-white">{game.title}</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{game.modes.length} Active Modes</p>
                </div>
              </div>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {game.modes.slice(0, 3).map((m: any, i: number) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-400">{m.name[0]}</div>
                  ))}
                </div>
                {isOwner ? <Settings2 size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" /> : <Lock size={14} className="text-slate-700" />}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </AppLayout>
  );
};

export default GameRegistry;