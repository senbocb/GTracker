"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings2, Check } from 'lucide-react';

export interface QuickStatConfig {
  id: string;
  label: string;
  enabled: boolean;
  type: 'common' | 'game';
  gameId?: string;
}

interface QuickStatsSettingsProps {
  configs: QuickStatConfig[];
  onUpdate: (configs: QuickStatConfig[]) => void;
}

const QuickStatsSettings = ({ configs, onUpdate }: QuickStatsSettingsProps) => {
  const toggleStat = (id: string) => {
    const newConfigs = configs.map(c => 
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    onUpdate(newConfigs);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
          <Settings2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black italic uppercase tracking-tight">STAT CONFIGURATION</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Common Metrics</p>
            {configs.filter(c => c.type === 'common').map(config => (
              <div key={config.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-sm font-bold uppercase tracking-tight">{config.label}</span>
                <Switch checked={config.enabled} onCheckedChange={() => toggleStat(config.id)} />
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Game Specific Metrics</p>
            {configs.filter(c => c.type === 'game').map(config => (
              <div key={config.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-sm font-bold uppercase tracking-tight">{config.label}</span>
                <Switch checked={config.enabled} onCheckedChange={() => toggleStat(config.id)} />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickStatsSettings;