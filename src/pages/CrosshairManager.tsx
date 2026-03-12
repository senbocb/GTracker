"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Target, Plus, Copy, Trash2, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { showSuccess, showError } from '@/utils/toast';

interface Crosshair {
  id: string;
  gameId: string;
  label: string;
  code: string;
  timestamp: string;
}

const CrosshairManager = () => {
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([]);
  const [registry, setRegistry] = useState<any>({});
  const [search, setSearch] = useState('');
  const [newCrosshair, setNewCrosshair] = useState({ gameId: '', label: '', code: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_crosshairs') || '[]');
    setCrosshairs(saved);
    const savedRegistry = JSON.parse(localStorage.getItem('combat_game_registry') || '{}');
    setRegistry(savedRegistry);
  }, []);

  const handleAdd = () => {
    if (!newCrosshair.gameId || !newCrosshair.label || !newCrosshair.code) {
      showError("All fields are required.");
      return;
    }
    const updated = [{ ...newCrosshair, id: Date.now().toString(), timestamp: new Date().toISOString() }, ...crosshairs];
    setCrosshairs(updated);
    localStorage.setItem('combat_crosshairs', JSON.stringify(updated));
    setNewCrosshair({ gameId: '', label: '', code: '' });
    showSuccess("Crosshair archived.");
  };

  const filtered = crosshairs.filter(c => c.label.toLowerCase().includes(search.toLowerCase()) || c.gameId.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4"><Target className="text-indigo-500" size={36} /> Crosshair Vault</h1>
          <p className="text-slate-400 font-medium">Secure storage for tactical reticle configurations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-slate-900/50 border-slate-800 sticky top-24">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400">New Entry</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-300">Operation</Label>
                    <Select value={newCrosshair.gameId} onValueChange={(v) => setNewCrosshair({...newCrosshair, gameId: v})}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white"><SelectValue placeholder="Select Game" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">{Object.keys(registry).map(game => <SelectItem key={game} value={game}>{game}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-300">Label</Label>
                    <Input placeholder="e.g. Tournament Dot" value={newCrosshair.label} onChange={(e) => setNewCrosshair({...newCrosshair, label: e.target.value})} className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-300">Crosshair Code</Label>
                    <Input placeholder="Paste code here..." value={newCrosshair.code} onChange={(e) => setNewCrosshair({...newCrosshair, code: e.target.value})} className="bg-slate-950 border-slate-800 font-mono text-xs text-white placeholder:text-slate-600" />
                  </div>
                  <Button onClick={handleAdd} className="w-full bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-6">Archive Code</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><Input placeholder="Search vault..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-900 border-slate-800 pl-10 h-12 text-white" /></div>
            <div className="grid grid-cols-1 gap-4">
              {filtered.length > 0 ? filtered.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 group hover:border-indigo-500/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-indigo-500 border border-slate-800"><Target size={20} /></div>
                    <div>
                      <div className="flex items-center gap-2"><h3 className="text-sm font-black text-white uppercase italic tracking-tight">{item.label}</h3><span className="px-1.5 py-0.5 rounded bg-indigo-600/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase">{item.gameId}</span></div>
                      <p className="text-[10px] font-mono text-slate-300 mt-1 truncate max-w-[200px] md:max-w-xs">{item.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(item.code); showSuccess("Copied."); }} className="h-10 w-10 text-slate-400 hover:text-white hover:bg-indigo-600/20"><Copy size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { const updated = crosshairs.filter(c => c.id !== item.id); setCrosshairs(updated); localStorage.setItem('combat_crosshairs', JSON.stringify(updated)); showSuccess("Removed."); }} className="h-10 w-10 text-slate-600 hover:text-red-400"><Trash2 size={16} /></Button>
                  </div>
                </div>
              )) : <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20"><p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Vault is empty</p></div>}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default CrosshairManager;