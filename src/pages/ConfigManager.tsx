"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { FileCode, Download, Trash2, Search, FileUp, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { showSuccess, showError } from '@/utils/toast';

interface ConfigFile {
  id: string;
  gameId: string;
  label: string;
  content: string;
  fileName: string;
  timestamp: string;
}

const ConfigManager = () => {
  const [configs, setConfigs] = useState<ConfigFile[]>([]);
  const [registry, setRegistry] = useState<any>({});
  const [search, setSearch] = useState('');
  const [newConfig, setNewConfig] = useState({ gameId: '', label: '', content: '', fileName: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_configs') || '[]');
    setConfigs(saved);
    const savedRegistry = JSON.parse(localStorage.getItem('combat_game_registry') || '{}');
    setRegistry(savedRegistry);
  }, []);

  const handleAdd = () => {
    if (!newConfig.gameId || !newConfig.label || !newConfig.content) {
      showError("Required fields missing.");
      return;
    }
    const updated = [{ ...newConfig, id: Date.now().toString(), timestamp: new Date().toISOString() }, ...configs];
    setConfigs(updated);
    localStorage.setItem('combat_configs', JSON.stringify(updated));
    setNewConfig({ gameId: '', label: '', content: '', fileName: '' });
    showSuccess("Config archived.");
  };

  const filtered = configs.filter(c => c.label.toLowerCase().includes(search.toLowerCase()) || c.gameId.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4"><FileCode className="text-indigo-500" size={36} /> Config Archive</h1>
          <p className="text-slate-400 font-medium">Centralized repository for game settings and autoexec files.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-slate-900/50 border-slate-800 sticky top-24">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400">Archive New Config</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-300">Operation</Label>
                    <Select value={newConfig.gameId} onValueChange={(v) => setNewConfig({...newConfig, gameId: v})}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white"><SelectValue placeholder="Select Game" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">{Object.keys(registry).map(game => <SelectItem key={game} value={game}>{game}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-300">Label</Label>
                    <Input placeholder="e.g. Pro Settings v2" value={newConfig.label} onChange={(e) => setNewConfig({...newConfig, label: e.target.value})} className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-300">Content</Label>
                    <Textarea placeholder="Paste raw config text here..." value={newConfig.content} onChange={(e) => setNewConfig({...newConfig, content: e.target.value})} className="bg-slate-950 border-slate-800 font-mono text-[10px] h-32 text-white placeholder:text-slate-600" />
                  </div>
                  <Button onClick={handleAdd} className="w-full bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-6">Archive Config</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><Input placeholder="Search archive..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-900 border-slate-800 pl-10 h-12 text-white" /></div>
            <div className="grid grid-cols-1 gap-4">
              {filtered.length > 0 ? filtered.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 group hover:border-indigo-500/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-indigo-500 border border-slate-800"><FileText size={24} /></div>
                    <div>
                      <div className="flex items-center gap-2"><h3 className="text-base font-black text-white uppercase italic tracking-tight">{item.label}</h3><span className="px-2 py-0.5 rounded bg-indigo-600/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase">{item.gameId}</span></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Archived {new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { const blob = new Blob([item.content], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${item.label}.cfg`; a.click(); }} className="h-10 w-10 text-slate-400 hover:text-white hover:bg-indigo-600/20"><Download size={18} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { const updated = configs.filter(c => c.id !== item.id); setConfigs(updated); localStorage.setItem('combat_configs', JSON.stringify(updated)); showSuccess("Removed."); }} className="h-10 w-10 text-slate-600 hover:text-red-400"><Trash2 size={18} /></Button>
                  </div>
                </div>
              )) : <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20"><p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Archive is empty</p></div>}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default ConfigManager;