"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RankBadge from './RankBadge';
import { Swords, Activity, MoreHorizontal, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';

interface Match {
  id: string;
  game: string;
  result: string;
  change: string;
  map: string;
  score: string;
  date: string;
}

const MatchHistory = ({ matches = [] }: { matches?: Match[] }) => {
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('game_history').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete match");
    } else {
      toast.success("Match deleted");
      queryClient.invalidateQueries({ queryKey: ['games'] });
    }
  };

  return (
    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-800/50 bg-slate-900/50">
        <CardTitle className="text-sm font-black italic uppercase tracking-widest flex items-center gap-2 text-white">
          <Activity size={16} className="text-indigo-500" />
          Recent Changes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-indigo-500/30 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-1.5 h-8 rounded-full ${
                  match.result.includes('Peak') ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 
                  match.result.includes('win') ? 'bg-emerald-500' : 
                  match.result.includes('loss') ? 'bg-red-500' : 'bg-indigo-500'
                }`} />
                <div>
                  <p className="text-xs font-black text-white uppercase italic tracking-tight">{match.game}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{match.map}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1 font-mono font-black text-xs text-indigo-400">
                    <RankBadge rank={match.change} gameTitle={match.game} className="scale-75 origin-right" />
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{match.date}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-950 border-slate-800 text-white">
                    <DropdownMenuItem 
                      onClick={() => handleDelete(match.id)}
                      className="text-red-400 focus:text-red-400 focus:bg-red-400/10"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete Log
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto text-slate-700">
              <Swords size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No recent activity logged</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchHistory;