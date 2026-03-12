"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, Trophy, ChevronRight } from 'lucide-react';
import RankBadge from './RankBadge';
import { cn } from '@/lib/utils';

const CS2_MAPS = ["Mirage", "Inferno", "Dust II", "Nuke", "Vertigo", "Ancient", "Anubis", "Overpass"];

interface CS2MapRanksProps {
  gameId: string;
  onLogClick: (mapName: string) => void;
}

const CS2MapRanks = ({ gameId, onLogClick }: CS2MapRanksProps) => {
  const [mapRanks, setMapRanks] = useState<Record<string, any>>({});

  useEffect(() => {
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    const game = savedGames.find((g: any) => g.id === gameId);
    if (game) {
      const perMapMode = game.modes.find((m: any) => m.name === 'Per-Map Rank');
      if (perMapMode && perMapMode.history) {
        const latest: Record<string, any> = {};
        // History is sorted newest first
        perMapMode.history.forEach((h: any) => {
          if (h.map && !latest[h.map]) {
            latest[h.map] = h;
          }
        });
        setMapRanks(latest);
      }
    }
  }, [gameId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-slate-800 bg-slate-900/50 text-indigo-400 hover:text-white hover:bg-indigo-600/10">
          <MapIcon className="mr-2" size={16} />
          VIEW MAP RANK VAULT
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[450px] p-0 overflow-hidden">
        <div className="bg-slate-900 p-6 border-b border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              MAP RANK ARCHIVE
            </DialogTitle>
          </DialogHeader>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Individual ratings for the active duty map pool</p>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {CS2_MAPS.map((map) => {
            const data = mapRanks[map];
            return (
              <div 
                key={map} 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-slate-600 group-hover:text-indigo-400 transition-colors">
                    <MapIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase italic tracking-tight">{map}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      {data ? `Updated ${new Date(data.timestamp).toLocaleDateString()}` : 'No Data'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {data ? (
                    <RankBadge rank={data.rank} tier={data.tier} gameTitle="Counter-Strike 2" className="scale-90" />
                  ) : (
                    <span className="text-[10px] font-black text-slate-700 uppercase">Unranked</span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-white"
                    onClick={() => onLogClick(map)}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CS2MapRanks;