"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Trophy, Target, Zap, Calendar, Clock, 
  Gamepad2, Shield, ChevronRight, Loader2, Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";

const matchSchema = z.object({
  game_id: z.string().uuid('Select a game'),
  result: z.enum(['win', 'loss', 'draw']),
  rank_before: z.string().min(1, 'Required'),
  rank_after: z.string().min(1, 'Required'),
  played_at: z.string().min(1, 'Required'),
  notes: z.string().max(500).optional(),
});

interface AddMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMatchModal = ({ isOpen, onClose, onSuccess }: AddMatchModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  
  const getCurrentLocalTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    game_id: '',
    result: 'win' as 'win' | 'loss' | 'draw',
    rank_before: '',
    rank_after: '',
    played_at: getCurrentLocalTime(),
    notes: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchGames();
      setFormData(prev => ({ ...prev, played_at: getCurrentLocalTime() }));
    }
  }, [isOpen, user]);

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', user?.id);
    setGames(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsed = matchSchema.safeParse(formData);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      // Find the first mode for the selected game to log history against
      const { data: modes } = await supabase
        .from('game_modes')
        .select('id')
        .eq('game_id', formData.game_id)
        .limit(1);

      if (!modes || modes.length === 0) throw new Error("No modes found for this game");

      const { error } = await supabase.from('game_history').insert({
        mode_id: modes[0].id,
        result: formData.result,
        rank: formData.rank_after,
        timestamp: new Date(formData.played_at).toISOString()
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success("Match logged successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error logging match:", err);
      toast.error(err.message || "Failed to log match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Target className="text-indigo-500" />
            Log Operation
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            Record your latest combat data to the archive
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Game</label>
              <Select onValueChange={(val) => setFormData({...formData, game_id: val})}>
                <SelectTrigger className="bg-slate-900 border-slate-800 h-12 text-xs font-bold uppercase">
                  <SelectValue placeholder="Choose Game" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {games.map(game => (
                    <SelectItem key={game.id} value={game.id} className="text-xs font-bold uppercase">
                      {game.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Result</label>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    onClick={() => setFormData({...formData, result: 'win'})}
                    className={cn("flex-1 h-12 text-[10px] font-black uppercase tracking-widest", formData.result === 'win' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800')}
                  >Win</Button>
                  <Button 
                    type="button"
                    onClick={() => setFormData({...formData, result: 'draw'})}
                    className={cn("flex-1 h-12 text-[10px] font-black uppercase tracking-widest", formData.result === 'draw' ? 'bg-yellow-600 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800')}
                  >Draw</Button>
                  <Button 
                    type="button"
                    onClick={() => setFormData({...formData, result: 'loss'})}
                    className={cn("flex-1 h-12 text-[10px] font-black uppercase tracking-widest", formData.result === 'loss' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800')}
                  >Loss</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</label>
                <Input 
                  type="datetime-local"
                  value={formData.played_at}
                  onChange={(e) => setFormData({...formData, played_at: e.target.value})}
                  className="bg-slate-900 border-slate-800 h-12 text-[10px] font-bold uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rank Before</label>
                <Input 
                  placeholder="Current Rank"
                  value={formData.rank_before}
                  onChange={(e) => setFormData({...formData, rank_before: e.target.value})}
                  className="bg-slate-900 border-slate-800 h-12 text-xs font-bold uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rank After</label>
                <Input 
                  placeholder="New Rank"
                  value={formData.rank_after}
                  onChange={(e) => setFormData({...formData, rank_after: e.target.value})}
                  className="bg-slate-900 border-slate-800 h-12 text-xs font-bold uppercase"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
            >Abort</Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              Confirm Log
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMatchModal;