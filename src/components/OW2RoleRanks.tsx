"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Sword, Heart, Trophy, ChevronRight } from 'lucide-react';
import RankBadge from './RankBadge';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

const ROLES = [
  { name: 'Tank', icon: <Shield size={18} />, color: 'text-blue-400' },
  { name: 'Damage', icon: <Sword size={18} />, color: 'text-red-400' },
  { name: 'Support', icon: <Heart size={18} />, color: 'text-emerald-400' }
];

interface OW2RoleRanksProps {
  gameId: string;
  onLogClick?: () => void;
}

const OW2RoleRanks = ({ gameId, onLogClick }: OW2RoleRanksProps) => {
  const [roleRanks, setRoleRanks] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchRanks = async () => {
      const { data: gameData } = await supabase
        .from('games')
        .select('*, game_modes(*, game_history(*))')
        .eq('id', gameId)
        .single();

      if (gameData) {
        const roleQueueMode = gameData.game_modes.find((m: any) => m.name === 'Role Queue');
        if (roleQueueMode && roleQueueMode.game_history) {
          const latest: Record<string, any> = {};
          const peak: Record<string, any> = {};
          
          const history = [...roleQueueMode.game_history].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          history.forEach((h: any) => {
            if (h.agent && !latest[h.agent]) {
              latest[h.agent] = h;
            }
            if (!peak[h.agent]) peak[h.agent] = h;
          });
          
          setRoleRanks({ latest, peak });
        }
      }
    };

    fetchRanks();
  }, [gameId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-slate-800 bg-slate-900/50 text-indigo-400 hover:text-white hover:bg-indigo-600/10 h-12 rounded-xl font-black uppercase tracking-widest">
          <Shield className="mr-2" size={18} />
          View Role Ranks
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[450px] p-0 overflow-hidden">
        <div className="bg-slate-900 p-6 border-b border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Role Rank Archive
            </DialogTitle>
          </DialogHeader>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Individual ratings for Tank, Damage, and Support</p>
        </div>
        <div className="p-4 space-y-2">
          {ROLES.map((role) => {
            const current = roleRanks.latest?.[role.name];
            const peak = roleRanks.peak?.[role.name];
            
            return (
              <div 
                key={role.name} 
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center", role.color)}>
                    {role.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase italic tracking-tight">{role.name}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      Peak: {peak ? `${peak.rank} ${peak.tier || ''}` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {current ? (
                    <RankBadge rank={current.rank} tier={current.tier} gameTitle="Overwatch 2" className="scale-90" />
                  ) : (
                    <span className="text-[10px] font-black text-slate-700 uppercase">Unranked</span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-white"
                    onClick={onLogClick}
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

export default OW2RoleRanks;