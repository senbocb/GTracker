"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Plus, Trash2, GripVertical, Save, ChevronLeft, Camera, Gamepad2, ListOrdered, Layers, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { showSuccess, showError } from '@/utils/toast';
import { processImage } from '@/utils/imageProcessing';
import { cn } from '@/lib/utils';

// DnD Kit for rank ordering
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DEFAULT_REGISTRY = {
  "Valorant": { 
    ranks: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"],
    modes: ["Competitive", "Premier"]
  },
  "Counter-Strike 2": { 
    ranks: ["Silver I", "Silver II", "Silver III", "Silver IV", "Silver Elite", "Silver Elite Master", "Gold Nova I", "Gold Nova II", "Gold Nova III", "Gold Nova Master", "Master Guardian I", "Master Guardian II", "Master Guardian Elite", "Distinguished Master Guardian", "Legendary Eagle", "Legendary Eagle Master", "Supreme Master First Class", "The Global Elite"],
    modes: ["Premier", "Competitive", "Wingman", "Faceit"]
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
    modes: ["Ranked"]
  }
};

const SortableRankItem = ({ id, rank, onRemove }: { id: string, rank: string, onRemove: (r: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg group">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400">
        <GripVertical size={14} />
      </div>
      <span className="flex-1 text-xs font-bold uppercase text-slate-200">{rank}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100" onClick={() => onRemove(rank)}>
        <Trash2 size={12} />
      </Button>
    </div>
  );
};

const GameRegistry = () => {
  const [registry, setRegistry] = useState<any>({});
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [tempGame, setTempGame] = useState<any>(null);
  const [newRank, setNewRank] = useState('');
  const [newMode, setNewMode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_game_registry') || 'null');
    if (saved) {
      setRegistry(saved);
    } else {
      localStorage.setItem('combat_game_registry', JSON.stringify(DEFAULT_REGISTRY));
      setRegistry(DEFAULT_REGISTRY);
    }
  }, []);

  const startEditing = (name: string) => {
    const gameData = registry[name] || { ranks: [], modes: [], image: '' };
    setEditingGame(name);
    setTempGame({ 
      name, 
      ranks: gameData.ranks || [], 
      modes: gameData.modes || [], 
      image: gameData.image || '' 
    });
  };

  const createNewGame = () => {
    const name = "NEW_OPERATION_" + Date.now().toString().slice(-4);
    const newEntry = { ranks: [], modes: [], image: '' };
    const updated = { ...registry, [name]: newEntry };
    setRegistry(updated);
    localStorage.setItem('combat_game_registry', JSON.stringify(updated));
    startEditing(name);
  };

  const saveChanges = () => {
    if (!tempGame) return;
    const { name, ...data } = tempGame;
    const updated = { ...registry };
    if (editingGame && editingGame !== name) delete updated[editingGame];
    updated[name] = data;
    setRegistry(updated);
    localStorage.setItem('combat_game_registry', JSON.stringify(updated));
    setEditingGame(null);
    showSuccess("Registry updated.");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && tempGame) {
      try {
        const processed = await processImage(file, 800, 450, 0.7);
        setTempGame({ ...tempGame, image: processed });
      } catch (err) {
        showError("Image processing failed.");
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tempGame.ranks.indexOf(active.id);
      const newIndex = tempGame.ranks.indexOf(over.id);
      setTempGame({ ...tempGame, ranks: arrayMove(tempGame.ranks, oldIndex, newIndex) });
    }
  };

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">GAME REGISTRY</h1>
          <p className="text-slate-400 font-medium">Define the operational parameters and rank hierarchies for all supported games.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={createNewGame}
            className="h-64 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center gap-4 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
              <Plus size={32} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300">Initialize New Game</span>
          </button>

          {Object.entries(registry).map(([name, data]: [string, any]) => (
            <Card 
              key={name} 
              onClick={() => startEditing(name)}
              className="h-64 bg-slate-900 border-slate-800 overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all"
            >
              <div className="relative h-32 bg-slate-950">
                {data.image ? (
                  <img src={data.image} alt={name} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-800">
                    <Gamepad2 size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{name}</h3>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-1"><ListOrdered size={12} /> {data.ranks?.length || 0} Ranks</span>
                  <span className="flex items-center gap-1"><Layers size={12} /> {data.modes?.length || 0} Modes</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.ranks?.slice(0, 3).map((r: string) => (
                    <span key={r} className="px-2 py-0.5 rounded bg-slate-800 text-[8px] font-black text-slate-400 uppercase">{r}</span>
                  ))}
                  {data.ranks?.length > 3 && <span className="text-[8px] font-black text-slate-600">+{data.ranks.length - 3} MORE</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!editingGame} onOpenChange={(v) => !v && setEditingGame(null)}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[600px] p-0 overflow-hidden">
            {tempGame && (
              <>
                <div className="relative h-40 bg-slate-900">
                  {tempGame.image ? (
                    <img src={tempGame.image} alt="" className="w-full h-full object-cover opacity-50" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-800"><Gamepad2 size={64} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 bg-slate-950/50 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={18} />
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <div className="absolute bottom-6 left-6 right-6">
                    <Input 
                      value={tempGame.name} 
                      onChange={(e) => setTempGame({ ...tempGame, name: e.target.value })}
                      className="bg-transparent border-none text-3xl font-black italic uppercase tracking-tighter p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                        <ListOrdered size={14} /> Rank Hierarchy (Lowest to Highest)
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add Rank (e.g. Gold I)" 
                        value={newRank} 
                        onChange={(e) => setNewRank(e.target.value)}
                        className="bg-slate-900 border-slate-800 h-10"
                        onKeyDown={(e) => e.key === 'Enter' && (setTempGame({ ...tempGame, ranks: [...(tempGame.ranks || []), newRank] }), setNewRank(''))}
                      />
                      <Button onClick={() => { setTempGame({ ...tempGame, ranks: [...(tempGame.ranks || []), newRank] }); setNewRank(''); }} className="bg-indigo-600"><Plus size={18} /></Button>
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={tempGame.ranks || []} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {(tempGame.ranks || []).map((rank: string) => (
                            <SortableRankItem 
                              key={rank} 
                              id={rank} 
                              rank={rank} 
                              onRemove={(r) => setTempGame({ ...tempGame, ranks: tempGame.ranks.filter((x: string) => x !== r) })} 
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </section>

                  <section className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                      <Layers size={14} /> Available Modes
                    </Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add Mode (e.g. Ranked)" 
                        value={newMode} 
                        onChange={(e) => setNewMode(e.target.value)}
                        className="bg-slate-900 border-slate-800 h-10"
                        onKeyDown={(e) => e.key === 'Enter' && (setTempGame({ ...tempGame, modes: [...(tempGame.modes || []), newMode] }), setNewMode(''))}
                      />
                      <Button onClick={() => { setTempGame({ ...tempGame, modes: [...(tempGame.modes || []), newMode] }); setNewMode(''); }} className="bg-indigo-600"><Plus size={18} /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(tempGame.modes || []).map((mode: string) => (
                        <div key={mode} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 group">
                          <span className="text-xs font-bold uppercase">{mode}</span>
                          <button onClick={() => setTempGame({ ...tempGame, modes: tempGame.modes.filter((m: string) => m !== mode) })} className="text-slate-600 hover:text-red-400">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <DialogFooter className="p-6 bg-slate-900 border-t border-slate-800">
                  <div className="flex gap-3 w-full">
                    <Button 
                      variant="destructive" 
                      className="flex-1 font-black uppercase"
                      onClick={() => {
                        const updated = { ...registry };
                        delete updated[editingGame!];
                        setRegistry(updated);
                        localStorage.setItem('combat_game_registry', JSON.stringify(updated));
                        setEditingGame(null);
                        showSuccess("Game removed from registry.");
                      }}
                    >
                      Delete Game
                    </Button>
                    <Button onClick={saveChanges} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 font-black uppercase">
                      <Save size={18} className="mr-2" /> Save Definition
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </AppLayout>
  );
};

export default GameRegistry;