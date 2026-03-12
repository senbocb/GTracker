"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { CheckCircle2, Circle, Plus, Trash2, Flame, Calendar as CalendarIcon, Target, Zap, Clock, Trophy, XCircle, FolderPlus, ListMusic, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { format, startOfToday, eachDayOfInterval, subDays, isSameDay, addDays, differenceInDays, parseISO, isAfter } from 'date-fns';

type LogStatus = 'done' | 'failed' | 'none';

interface HabitPlaylist {
  id: string;
  name: string;
  description: string;
}

interface Habit {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  endDate?: string;
  playlistId?: string;
  logs: Record<string, LogStatus>;
}

const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [playlists, setPlaylists] = useState<HabitPlaylist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({ name: '', description: '', playlistId: 'none' });
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const [calendarOpenId, setCalendarOpenId] = useState<string | null>(null);

  useEffect(() => {
    const savedHabits = JSON.parse(localStorage.getItem('combat_habits_v4') || '[]');
    const savedPlaylists = JSON.parse(localStorage.getItem('combat_habit_playlists') || '[]');
    setHabits(savedHabits);
    setPlaylists(savedPlaylists);
  }, []);

  const saveAll = (h: Habit[], p: HabitPlaylist[]) => {
    setHabits(h);
    setPlaylists(p);
    localStorage.setItem('combat_habits_v4', JSON.stringify(h));
    localStorage.setItem('combat_habit_playlists', JSON.stringify(p));
  };

  const handleAddHabit = () => {
    if (!newHabit.name) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description || '',
      createdAt: new Date().toISOString(),
      playlistId: newHabit.playlistId === 'none' ? undefined : newHabit.playlistId,
      logs: {}
    };
    saveAll([habit, ...habits], playlists);
    setNewHabit({ name: '', description: '', playlistId: 'none' });
    setIsAddOpen(false);
    showSuccess(`Habit "${habit.name}" initialized.`);
  };

  const handleAddPlaylist = () => {
    if (!newPlaylist.name) return;
    const playlist: HabitPlaylist = { id: Date.now().toString(), ...newPlaylist };
    saveAll(habits, [...playlists, playlist]);
    setNewPlaylist({ name: '', description: '' });
    setIsPlaylistOpen(false);
    showSuccess(`Playlist "${playlist.name}" created.`);
  };

  const cycleStatus = (habitId: string, date: Date) => {
    if (isAfter(date, startOfToday())) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const current = h.logs[dateStr] || 'none';
        let next: LogStatus = current === 'none' ? 'done' : current === 'done' ? 'failed' : 'none';
        const newLogs = { ...h.logs };
        if (next === 'none') delete newLogs[dateStr]; else newLogs[dateStr] = next;
        return { ...h, logs: newLogs };
      }
      return h;
    });
    saveAll(updated, playlists);
  };

  const calculateStreak = (logs: Record<string, LogStatus>) => {
    let streak = 0;
    const today = startOfToday();
    if (logs[format(today, 'yyyy-MM-dd')] !== 'done' && logs[format(subDays(today, 1), 'yyyy-MM-dd')] !== 'done') return 0;
    for (let i = 0; i < 365; i++) {
      if (logs[format(subDays(today, i), 'yyyy-MM-dd')] === 'done') streak++; else break;
    }
    return streak;
  };

  const filteredHabits = useMemo(() => {
    if (activePlaylistId === 'all') return habits;
    return habits.filter(h => h.playlistId === activePlaylistId);
  }, [habits, activePlaylistId]);

  const next7Days = useMemo(() => {
    const today = startOfToday();
    return eachDayOfInterval({ start: today, end: addDays(today, 6) });
  }, []);

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4"><Zap className="text-yellow-500" size={36} /> Habit Tracker</h1>
            <p className="text-slate-400 font-medium">Organize and track your daily routines across custom playlists.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsPlaylistOpen(true)} className="border-slate-800 bg-slate-900/50 font-black uppercase py-6 px-6 rounded-2xl"><FolderPlus size={20} className="mr-2" /> New Playlist</Button>
            <Button onClick={() => setIsAddOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-6 px-8 rounded-2xl shadow-lg shadow-indigo-600/20"><Plus size={20} className="mr-2" /> New Habit</Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0 space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-4">Playlists</p>
            <Button variant="ghost" className={cn("w-full justify-start gap-3 h-11 font-bold uppercase italic tracking-tight text-xs", activePlaylistId === 'all' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white")} onClick={() => setActivePlaylistId('all')}><ListMusic size={18} /> All Habits</Button>
            {playlists.map(p => (
              <Button key={p.id} variant="ghost" className={cn("w-full justify-start gap-3 h-11 font-bold uppercase italic tracking-tight text-xs", activePlaylistId === p.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white")} onClick={() => setActivePlaylistId(p.id)}><FolderPlus size={18} /> {p.name}</Button>
            ))}
          </aside>

          <div className="flex-1 space-y-6">
            {filteredHabits.length > 0 ? filteredHabits.map((habit) => {
              const streak = calculateStreak(habit.logs);
              return (
                <Card key={habit.id} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden group">
                  <div className={cn("h-1 w-full transition-colors", streak > 0 ? "bg-indigo-500" : "bg-slate-800")} />
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="flex-1 flex items-start gap-4">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0", streak > 0 ? "bg-orange-500/20 text-orange-500" : "bg-slate-800 text-slate-600")}><Flame size={28} className={cn(streak > 0 && "animate-pulse")} /></div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tight truncate">{habit.name}</h3>
                          <p className="text-xs text-slate-500 font-medium">{habit.description || 'No description.'}</p>
                          {habit.playlistId && <span className="inline-block mt-2 px-2 py-0.5 rounded bg-indigo-600/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase">{playlists.find(p => p.id === habit.playlistId)?.name}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="text-center"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Streak</p><p className="text-3xl font-black text-white tabular-nums">{streak} <span className="text-xs text-slate-600">DAYS</span></p></div>
                        <div className="flex items-center gap-2">
                          {next7Days.map((date) => {
                            const status = habit.logs[format(date, 'yyyy-MM-dd')] || 'none';
                            const isToday = isSameDay(date, startOfToday());
                            const isFuture = isAfter(date, startOfToday());
                            return (
                              <div key={date.toISOString()} className="flex flex-col items-center gap-2">
                                <div className="text-center mb-1"><p className={cn("text-[8px] font-black uppercase tracking-tighter", isToday ? "text-indigo-400" : "text-slate-600")}>{format(date, 'EEE')}</p></div>
                                <button onClick={() => !isFuture && cycleStatus(habit.id, date)} disabled={isFuture} className={cn("w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center", status === 'done' && "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20", status === 'failed' && "bg-red-600/20 border-red-500 text-red-500", status === 'none' && (isFuture ? "bg-slate-950/50 border-slate-900 text-slate-800 cursor-not-allowed" : "bg-slate-950 border-slate-800 text-slate-700 hover:border-slate-600"))}>{status === 'done' ? <CheckCircle2 size={20} /> : status === 'failed' ? <XCircle size={20} /> : <Circle size={20} />}</button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 border-l border-slate-800 pl-6">
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-700 hover:text-red-500" onClick={() => saveAll(habits.filter(h => h.id !== habit.id), playlists)}><Trash2 size={18} /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }) : <div className="p-20 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/20"><div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto mb-6 text-slate-700"><Target size={32} /></div><h3 className="text-xl font-bold text-slate-300 mb-2">No Habits Found</h3><p className="text-slate-500 max-w-xs mx-auto text-sm mb-8">Start building consistency by adding your first habit to this playlist.</p></div>}
          </div>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white">
            <DialogHeader><DialogTitle className="italic uppercase font-black">Initialize Habit</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid gap-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Habit Name</Label><Input placeholder="e.g. 30m Aim Training" value={newHabit.name} onChange={(e) => setNewHabit({...newHabit, name: e.target.value})} className="bg-slate-900 border-slate-800" /></div>
              <div className="grid gap-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Playlist</Label><Select onValueChange={(v) => setNewHabit({...newHabit, playlistId: v})} value={newHabit.playlistId}><SelectTrigger className="bg-slate-900 border-slate-800"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-900 border-slate-800 text-white"><SelectItem value="none">No Playlist</SelectItem>{playlists.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Description</Label><Input placeholder="e.g. Kovaaks session" value={newHabit.description} onChange={(e) => setNewHabit({...newHabit, description: e.target.value})} className="bg-slate-900 border-slate-800" /></div>
            </div>
            <DialogFooter><Button onClick={handleAddHabit} className="w-full bg-indigo-600 font-black uppercase py-6">Start Habit</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white">
            <DialogHeader><DialogTitle className="italic uppercase font-black">Create Playlist</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid gap-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Playlist Name</Label><Input placeholder="e.g. Aim Training" value={newPlaylist.name} onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})} className="bg-slate-900 border-slate-800" /></div>
              <div className="grid gap-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Description</Label><Input placeholder="e.g. Daily aim routines" value={newPlaylist.description} onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})} className="bg-slate-900 border-slate-800" /></div>
            </div>
            <DialogFooter><Button onClick={handleAddPlaylist} className="w-full bg-indigo-600 font-black uppercase py-6">Create Playlist</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AppLayout>
  );
};

export default HabitTracker;