"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings2, ChevronRight, Gamepad2, Trophy, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickStatConfig {
  id: string;
  label: string;
  enabled: boolean;
  type: 'common' | 'game';
  gameId?: string;
  modeName?: string;
}

interface QuickStatsSettingsProps {
  configs: QuickStatConfig[];
  onUpdate: (configs: QuickStatConfig[]) => void;
  games: any[];
}

const QuickStatsSettings = ({ configs, onUpdate, games }: QuickStatsSettingsProps) => {
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  const toggleStat = (id: string) => {
    const newConfigs = configs.map(c => 
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    onUpdate(newConfigs);
  };

  const addModeStat = (gameId: string, modeName: string) => {
    const id = `peak_${gameId}_${modeName.replace(/\s+/g, '_')}`;
    if (configs.some(c => c.id === id)) return;

    const newConfig: QuickStatConfig = {
      id,
      label: `${modeName} Peak`,
      enabled: true,
      type: 'game',
      gameId,
      modeName
    };
    onUpdate([...configs, newConfig]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800/50 active:bg-slate-800">
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
            <div className="grid grid-cols-4 gap-2">
              {games.map(game => (
                <Button
                  key={game.id}
                  variant="outline"
                  className={cn(
                    "h-16 flex flex-col gap-1 border-slate-800 bg-slate-900 hover:bg-slate-800",
                    expandedGame === game.id && "border-indigo-500 bg-indigo-500/10"
                  )}
                  onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                >
                  {game.image ? (
                    <img src={game.image} alt="" className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <Gamepad2 size={16} className="text-slate-500" />
                  )}
                  <span className="text-[8px] font-black uppercase truncate w-full">{game.title}</span>
                </Button>
              ))}
            </div>

            {expandedGame && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 animate-in fade-in slide-in-from-top-2">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">
                  {games.find(g => g.id === expandedGame)?.title} Peak Ranks
                </p>
                <div className="space-y-2">
                  {games.find(g => g.id === expandedGame)?.modes.map((mode: any) => {
                    const configId = `peak_${expandedGame}_${mode.name.replace(/\s+/g, '_')}`;
                    const config = configs.find(c => c.id === configId);
                    
                    return (
                      <div key={mode.name} className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-tight">{mode.name}</span>
                        {config ? (
                          <Switch checked={config.enabled} onCheckedChange={() => toggleStat(config.id)} />
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-[9px] font-black uppercase text-indigo-400 hover:text-white"
                            onClick={() => addModeStat(expandedGame!, mode.name)}
                          >
                            <Plus size={10} className="mr-1" /> Track
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {configs.filter(c => c.type === 'game' && c.enabled).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Game Stats</p>
              <div className="space-y-2">
                {configs.filter(c => c.type === 'game' && c.enabled).map(config => (
                  <div key={config.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Trophy size={12} className="text-yellow-500" />
                      <span className="text-[10px] font-bold uppercase">{config.label}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-600 hover:text-red-400"
                      onClick={() => toggleStat(config.id)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickStatsSettings;