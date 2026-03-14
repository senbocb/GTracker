"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, Trophy } from 'lucide-react';
import RankBadge from './RankBadge';

const CS2_MAPS = ["Anubis", "Overpass", "Inferno", "Mirage", "Dust 2", "Nuke", "Ancient", "Train", "Vertigo", "Warden", "Stronghold", "Alpine", "Office", "Italy"];

interface CS2MapPopupProps {
  gameId: string;
  history: any[];
}

const CS2MapPopup = ({ gameId, history = [] }: CS2MapPopupProps) => {
  const getLatestRank = (mapName: string) => {
    const mapLogs = history.filter(h => h.map === mapName).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return mapLogs[0] || { rank: 'Unranked', tier: '' };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-slate-900 border-slate-800 text-indigo-400 hover:text-white hover:bg-indigo-600/20 font-black uppercase py-6">
          <MapIcon className="mr-2" size={18} /> View Map Ranks
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[60%] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
            <Trophy className="text-yellow-500" /> CS2 Competitive (Per Map)
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
          {CS2_MAPS.map(map => {
            const latest = getLatestRank(map);
            return (
              <div key={map} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">{map}</span>
                </div>
                <RankBadge rank={latest.rank} tier={latest.tier} gameTitle="Counter-Strike 2" className="w-full" />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CS2MapPopup;