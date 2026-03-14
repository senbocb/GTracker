"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Trash2, GripVertical, Save, Camera, Gamepad2, ListOrdered, Layers, Edit2, Check, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { showSuccess, showError } from '@/utils/toast';
import { processImage } from '@/utils/imageProcessing';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

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

const SortableRankItem = ({ 
  id, 
  rank, 
  color,
  onRemove, 
  onEdit 
}: { 
  id: string, 
  rank: string, 
  color: string,
  onRemove: (r: string) => void,
  onEdit: (r: string) => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg group">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400">
        <GripVertical size={14} />
      </div>
      <div 
        className="w-4 h-4 rounded-sm border border-white/10" 
        style={{ backgroundColor: color || '#64748b' }} 
      />
      <span className="flex-1 text-xs font-bold uppercase text-slate-200">{rank}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => onEdit(rank)}>
          <Edit2 size={12} />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-600 hover:text-red-400" onClick={() => onRemove(rank)}>
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
};

const GameRegistry = () => {
  const { user } = useAuth();
  const [registry, setRegistry] = useState<any[]>([]);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [newRank, setNewRank] = useState('');
  const [newMode, setNewMode] = useState('');
  const [editingRank, setEditingRank] = useState<{ oldName: string, newName: string, color: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    if (user) fetchRegistry();
  }, [user]);

  const fetchRegistry = async () => {
    const { data } = await supabase.from('game_registry').select('*').eq('user_id', user?.id);
    setRegistry(data || []);
    setLoading(false);
  };

  const handleSaveGame = async () => {
    if (!editingGame) return;
    try {
      const { error } = await supabase
        .from('game_registry')
        .upsert({
          ...editingGame,
          user_id: user?.id
        });
      
      if (error) throw error;
      showSuccess("Registry updated.");
      setEditingGame(null);
      fetchRegistry();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = editingGame.ranks.indexOf(active.id);
      const newIndex = editingGame.ranks.indexOf(over.id);
      setEditingGame({ ...editingGame, ranks: arrayMove(editingGame.ranks, oldIndex, newIndex) });
    }
  };

  const updateRankConfig = () => {
    if (!editingRank || !editingGame) return;
    const newRanks = editingGame.ranks.map((r: string) => r === editingRank.oldName ? editingRank.newName : r);
    const newConfigs = { ...editingGame.rank_configs };
    delete newConfigs[editingRank.oldName];
    newConfigs[editingRank.newName] = { color: editingRank.color };
    
    setEditingGame({ ...editingGame, ranks: newRanks, rank_configs: newConfigs });
    setEditingRank(null);
  };

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">Game Registry</h1>
            <p className="text-slate-400 font-medium">Define rank hierarchies and visual styles for your tracked operations.</p>
          </div>
          <Button onClick={() => setEditingGame({ title: 'New Game', ranks: [], modes: [], rank_configs: {}, enable_rainbow: true })} className="bg-indigo-600">
            <Plus className="mr-2" /> Add Game
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {registry.map((game) => (
            <Card key={game.id} onClick={() => setEditingGame(game)} className="h-64 bg-slate-900 border-slate-800 overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all">
              <div className="relative h-32 bg-slate-950">
                {game.image ? <img src={game.image} alt={game.title} className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-slate-800"><Gamepad2 size={48} /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-4 left-4"><h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{game.title}</h3></div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-1"><ListOrdered size={12} /> {game.ranks?.length || 0} Ranks</span>
                  <span className="flex items-center gap-1"><Layers size={12} /> {game.modes?.length || 0} Modes</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {game.ranks?.slice(0, 5).map((r: string) => (
                    <div key={r} className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: game.rank_configs?.[r]?.color || '#64748b' }} />
                      <span className="text-[8px] font-black text-slate-400 uppercase">{r}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!editingGame} onOpenChange={(v) => !v && setEditingGame(null)}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[600px] p-0 overflow-hidden">
            {editingGame && (
              <>
                <div className="relative h-40 bg-slate-900">
                  {editingGame.image ? <img src={editingGame.image} alt="" className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full flex items-center justify-center text-slate-800"><Gamepad2 size={64} /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-slate-950/50 rounded-full" onClick={() => fileInputRef.current?.click()}><Camera size={18} /></Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const processed = await processImage(file, 800, 450, 0.7);
                      setEditingGame({ ...editingGame, image: processed });
                    }
                  }} />
                  <div className="absolute bottom-6 left-6 right-6">
                    <Input value={editingGame.title} onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })} className="bg-transparent border-none text-3xl font-black italic uppercase tracking-tighter p-0 h-auto focus-visible:ring-0" />
                  </div>
                </div>

                <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2"><ListOrdered size={14} /> Rank Hierarchy</Label>
                      <div className="flex items-center gap-2">
                        <Sparkles size={12} className={cn(editingGame.enable_rainbow ? "text-yellow-500" : "text-slate-600")} />
                        <span className="text-[9px] font-bold uppercase text-slate-500">Elite Rainbow</span>
                        <Switch checked={editingGame.enable_rainbow} onCheckedChange={(v) => setEditingGame({...editingGame, enable_rainbow: v})} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add Rank (e.g. Gold I)" value={newRank} onChange={(e) => setNewRank(e.target.value)} className="bg-slate-900 border-slate-800 h-10" onKeyDown={(e) => e.key === 'Enter' && (setEditingGame({ ...editingGame, ranks: [...editingGame.ranks, newRank] }), setNewRank(''))} />
                      <Button onClick={() => { setEditingGame({ ...editingGame, ranks: [...editingGame.ranks, newRank] }); setNewRank(''); }} className="bg-indigo-600"><Plus size={18} /></Button>
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={editingGame.ranks} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {editingGame.ranks.map((rank: string) => (
                            <SortableRankItem 
                              key={rank} 
                              id={rank} 
                              rank={rank} 
                              color={editingGame.rank_configs?.[rank]?.color || '#64748b'}
                              onRemove={(r) => setEditingGame({ ...editingGame, ranks: editingGame.ranks.filter((x: string) => x !== r) })} 
                              onEdit={(r) => setEditingRank({ oldName: r, newName: r, color: editingGame.rank_configs?.[r]?.color || '#64748b' })}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </section>

                  <section className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2"><Layers size={14} /> Available Modes</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Add Mode (e.g. Ranked)" value={newMode} onChange={(e) => setNewMode(e.target.value)} className="bg-slate-900 border-slate-800 h-10" onKeyDown={(e) => e.key === 'Enter' && (setEditingGame({ ...editingGame, modes: [...editingGame.modes, newMode] }), setNewMode(''))} />
                      <Button onClick={() => { setEditingGame({ ...editingGame, modes: [...editingGame.modes, newMode] }); setNewMode(''); }} className="bg-indigo-600"><Plus size={18} /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editingGame.modes.map((mode: string) => (
                        <div key={mode} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 group">
                          <span className="text-xs font-bold uppercase">{mode}</span>
                          <button onClick={() => setEditingGame({ ...editingGame, modes: editingGame.modes.filter((m: string) => m !== mode) })} className="text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <DialogFooter className="p-6 bg-slate-900 border-t border-slate-800">
                  <div className="flex gap-3 w-full">
                    <Button variant="destructive" className="flex-1 font-black uppercase" onClick={async () => { if(editingGame.id) await supabase.from('game_registry').delete().eq('id', editingGame.id); setEditingGame(null); fetchRegistry(); }}>Delete Game</Button>
                    <Button onClick={handleSaveGame} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 font-black uppercase"><Save size={18} className="mr-2" /> Save Definition</Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingRank} onOpenChange={(v) => !v && setEditingRank(null)}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white">
            <DialogHeader><DialogTitle className="italic uppercase font-black">Edit Rank Config</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Rank Name</Label>
                <Input value={editingRank?.newName} onChange={(e) => setEditingRank(prev => prev ? { ...prev, newName: e.target.value } : null)} className="bg-slate-900 border-slate-800" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Rank Color (Hex)</Label>
                <div className="flex gap-3">
                  <Input type="color" value={editingRank?.color} onChange={(e) => setEditingRank(prev => prev ? { ...prev, color: e.target.value } : null)} className="w-12 h-12 p-1 bg-slate-900 border-slate-800 cursor-pointer" />
                  <Input value={editingRank?.color} onChange={(e) => setEditingRank(prev => prev ? { ...prev, color: e.target.value } : null)} className="flex-1 bg-slate-900 border-slate-800 font-mono" />
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={updateRankConfig} className="w-full bg-indigo-600 font-black uppercase py-6"><Check size={18} className="mr-2" /> Update Rank</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AppLayout>
  );
};

export default GameRegistry;