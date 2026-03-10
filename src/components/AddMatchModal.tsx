"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Plus } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const AddMatchModal = () => {
  const [open, setOpen] = React.useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState('valorant');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_games') || '[]');
    setGames(saved);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Match logged successfully!");
    setOpen(false);
  };

  const isCS2 = selectedGame.toLowerCase().includes('counter-strike') || selectedGame === 'cs2';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-bold py-6 rounded-2xl border-dashed">
          <Plus className="mr-2" size={18} />
          LOG NEW MATCH
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
            <Swords className="text-blue-500" />
            LOG COMBAT DATA
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="game" className="text-xs font-bold uppercase text-slate-500">Select Game</Label>
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="bg-slate-900 border-slate-800">
                <SelectValue placeholder="Select game" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="valorant">Valorant</SelectItem>
                <SelectItem value="cs2">Counter-Strike 2</SelectItem>
                <SelectItem value="apex">Apex Legends</SelectItem>
                {games.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="result" className="text-xs font-bold uppercase text-slate-500">Result</Label>
              <Select defaultValue="win">
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue placeholder="Result" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="win">Victory</SelectItem>
                  <SelectItem value="loss">Defeat</SelectItem>
                  <SelectItem value="draw">Draw</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rr" className="text-xs font-bold uppercase text-slate-500">
                {isCS2 ? 'Rating Change' : 'RR Change'}
              </Label>
              <Input 
                id="rr" 
                type={isCS2 ? "number" : "text"}
                placeholder={isCS2 ? "+100" : "+25"} 
                className="bg-slate-900 border-slate-800" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="map" className="text-xs font-bold uppercase text-slate-500">Map / Arena</Label>
            <Input id="map" placeholder="e.g. Ascent" className="bg-slate-900 border-slate-800" />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-6 rounded-xl">
              CONFIRM LOG
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMatchModal;