"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map, Trophy, ChevronRight } from 'lucide-react';
import RankBadge from './RankBadge';
import { cn } from '@/lib/utils';

const MAPS = ["Anubis", "Overpass", "Inferno", "Mirage", "Dust 2", "Nuke", "Ancient", "Train", "Vertigo", "Warden", "Stronghold", "Alpine", "Office", "Italy"];

interface CS2MapPopupProps {
  gameId: string;
  history: any[];
  trigger?: React.ReactNode;
}

const CS2MapPopup = ({ gameId, history, trigger }: CS2MapPopupProps) => {
  const [mapRanks, setMapRanks] = useState<Record<string, any>>({});

  useEffect(() => {
    if (history && history.length > 0) {
      const latest: Record<string, any> = {};
      const peak: Record<string, any> = {};
      
      const sortedHistory = [...history].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      sortedHistory.forEach((h: any) => {
        if (h.map && !latest[h.map]) {
          latest[h.map] = h;
        }
        // Simple peak logic for CS2 (assuming rank string comparison or just first seen)
        if (h.map && !peak[h.map]) peak[h.map] = h;
      });
      
      setMapRanks({ latest, peak });
    }
  }, [history]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-slate-800 bg-slate-900/50 text-indigo-400 hover:text-white hover:bg-indigo-600/10 h-10 rounded-xl font-black uppercase tracking-widest">
            <Map className="mr-2" size={16} />
            Map Ranks
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[450px] p-0 overflow-hidden">
        <div className="bg-slate-900 p-6 border-b border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Map Rank Archive
            </DialogTitle>
          </DialogHeader>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Individual ratings for the active duty map pool</p>
        </div>
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {MAPS.map((mapName) => {
            const current = mapRanks.latest?.[mapName];
            const peak = mapRanks.peak?.[mapName];
            
            return (
              <div 
                key={mapName} 
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-indigo-400">
                    <Map size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase italic tracking-tight">{mapName}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      Peak: {peak ? peak.rank : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {current ? (
                    <RankBadge rank={current.rank} tier={current.tier} gameTitle="Counter-Strike 2" className="scale-90" />
                  ) : (
                    <span className="text-[10px] font-black text-slate-700 uppercase">Unranked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CS2MapPopup;