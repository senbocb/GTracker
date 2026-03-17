"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Trophy, History, Trash2, Edit2 } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  startRank?: string;
  startTier?: string;
}

interface SeasonManagerProps {
  gameId: string;
  seasons: Season[];
  onUpdate: (seasons: Season[]) => void;
}

const SeasonManager = ({ gameId, seasons, onUpdate }: SeasonManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [newSeason, setNewSeason] = useState({
    name: '',
    startDate: new Date().toISOString().slice(0, 10),
  });

  const handleAddSeason = () => {
    if (!newSeason.name) return;
    
    const updatedSeasons = [
      { ...newSeason, id: Date.now().toString() },
      ...seasons
    ].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    onUpdate(updatedSeasons);
    setNewSeason({ name: '', startDate: new Date().toISOString().slice(0, 10) });
    setIsOpen(false);
    showSuccess(`Season "${newSeason.name}" initialized.`);
  };

  const handleUpdateSeason = () => {
    if (!editingSeason) return;
    const updated = seasons.map(s => s.id === editingSeason.id ? editingSeason : s);
    onUpdate(updated);
    setEditingSeason(null);
    showSuccess("Season record updated.");
  };

  const removeSeason = (id: string) => {
    onUpdate(seasons.filter(s => s.id !== id));
    showSuccess("Season record removed.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <History size={16} className="text-indigo-500" />
          Operational Seasons
        </h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900/50 text-[10px] font-bold uppercase tracking-widest">
              <Plus size={14} className="mr-1" /> New Season
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-950 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="italic uppercase font-black">INITIALIZE SEASON</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-300">Season Name</Label>
                <Input 
                  placeholder="e.g. Episode 8: Act 1" 
                  value={newSeason.name} 
                  onChange={(e) => setNewSeason({...newSeason, name: e.target.value})}
                  className="bg-slate-900 border-slate-800"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-300">Start Date</Label>
                <Input 
                  type="date" 
                  value={newSeason.startDate} 
                  onChange={(e) => setNewSeason({...newSeason, startDate: e.target.value})}
                  className="bg-slate-900 border-slate-800"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSeason} className="w-full bg-indigo-600 font-black uppercase py-6">START SEASON</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {seasons.length > 0 ? seasons.map((season, idx) => (
          <div key={season.id} className={cn(
            "p-4 rounded-xl border flex items-center justify-between transition-all",
            idx === 0 ? "bg-indigo-600/10 border-indigo-500/30" : "bg-slate-900/50 border-slate-800"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                idx === 0 ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500"
              )}>
                <Trophy size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase italic tracking-tight">
                  {season.name}
                  {idx === 0 && <span className="ml-2 text-[9px] bg-indigo-600 px-1.5 py-0.5 rounded text-white not-italic">ACTIVE</span>}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={10} />
                  Started {new Date(season.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-600 hover:text-indigo-400"
                onClick={() => setEditingSeason(season)}
              >
                <Edit2 size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-600 hover:text-red-400"
                onClick={() => removeSeason(season.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No seasons defined for this operation</p>
          </div>
        )}
      </div>

      {editingSeason && (
        <Dialog open={!!editingSeason} onOpenChange={() => setEditingSeason(null)}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white">
            <DialogHeader><DialogTitle className="italic uppercase font-black">Edit Season</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Season Name</Label>
                <Input value={editingSeason.name} onChange={(e) => setEditingSeason({...editingSeason, name: e.target.value})} className="bg-slate-900 border-slate-800" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Start Date</Label>
                <Input type="date" value={editingSeason.startDate} onChange={(e) => setEditingSeason({...editingSeason, startDate: e.target.value})} className="bg-slate-900 border-slate-800" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateSeason} className="w-full bg-indigo-600 font-black uppercase py-6">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SeasonManager;