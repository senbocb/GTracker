"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Trophy, Calendar, Medal, DollarSign, Plus, Trash2, Swords } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface Tournament {
  id: string;
  name: string;
  date: string;
  placement: string;
  prize: string;
}

interface TournamentWidgetProps {
  gameId: string;
}

const TournamentWidget = ({ gameId }: TournamentWidgetProps) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTourney, setNewTourney] = useState({ name: '', date: new Date().toISOString().split('T')[0], placement: '', prize: '' });

  useEffect(() => {
    fetchTournaments();
  }, [gameId]);

  const fetchTournaments = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('game_id', gameId)
      .order('date', { ascending: false });
    
    if (data) setTournaments(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newTourney.name) return;
    const { error } = await supabase
      .from('tournaments')
      .insert({ ...newTourney, game_id: gameId, user_id: (await supabase.auth.getUser()).data.user?.id });
    
    if (error) showError(error.message);
    else {
      showSuccess("Tournament record archived.");
      setIsAddOpen(false);
      fetchTournaments();
      setNewTourney({ name: '', date: new Date().toISOString().split('T')[0], placement: '', prize: '' });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    if (error) showError(error.message);
    else {
      showSuccess("Record removed.");
      fetchTournaments();
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <Trophy size={16} className="text-yellow-500" />
          Tournament History
        </CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-white hover:bg-indigo-600/20">
              <Plus size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-950 border-slate-800 text-white">
            <DialogHeader><DialogTitle className="italic uppercase font-black">Log Tournament</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Event Name</Label>
                <Input value={newTourney.name} onChange={(e) => setNewTourney({...newTourney, name: e.target.value})} className="bg-slate-900 border-slate-800" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Date</Label>
                <Input type="date" value={newTourney.date} onChange={(e) => setNewTourney({...newTourney, date: e.target.value})} className="bg-slate-900 border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Placement</Label>
                  <Input placeholder="e.g. 1st" value={newTourney.placement} onChange={(e) => setNewTourney({...newTourney, placement: e.target.value})} className="bg-slate-900 border-slate-800" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Prize</Label>
                  <Input placeholder="e.g. $500" value={newTourney.prize} onChange={(e) => setNewTourney({...newTourney, prize: e.target.value})} className="bg-slate-900 border-slate-800" />
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleAdd} className="w-full bg-indigo-600 font-black uppercase py-6">Archive Record</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {tournaments.length > 0 ? tournaments.map((t) => (
          <div key={t.id} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-indigo-500">
                <Swords size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase italic">{t.name}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={10} /> {new Date(t.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-black text-yellow-500 uppercase">{t.placement}</p>
                <p className="text-[9px] font-bold text-emerald-500 uppercase">{t.prize}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(t.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        )) : (
          <div className="py-6 text-center border border-dashed border-slate-800 rounded-xl">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No tournament records found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TournamentWidget;