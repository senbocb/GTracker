"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { CheckCircle2, Circle, Plus, Trash2, Flame, Calendar, BarChart3, Target, Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { format, startOfToday, eachDayOfInterval, subDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

interface Habit {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  completions: string[]; // Array of ISO date strings (YYYY-MM-DD)
}

const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', description: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_habits') || '[]');
    setHabits(saved);
  }, []);

  const saveHabits = (updated: Habit[]) => {
    setHabits(updated);
    localStorage.setItem('combat_habits', JSON.stringify(updated));
  };

  const handleAddHabit = () => {
    if (!newHabit.name) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      createdAt: new Date().toISOString(),
      completions: []
    };
    saveHabits([habit, ...habits]);
    setNewHabit({ name: '', description: '' });
    setIsAddOpen(false);
    showSuccess(`Habit "${habit.name}" initialized.`);
  };

  const toggleCompletion = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const isCompleted = h.completions.includes(dateStr);
        const newCompletions = isCompleted 
          ? h.completions.filter(d => d !== dateStr)
          : [...h.completions, dateStr];
        return { ...h, completions: newCompletions };
      }
      return h;
    });
    saveHabits(updated);
  };

  const removeHabit = (id: string) => {
    saveHabits(habits.filter(h => h.id !== id));
    showSuccess("Habit decommissioned.");
  };

  const last7Days = useMemo(() => {
    const today = startOfToday();
    return eachDayOfInterval({
      start: subDays(today, 6),
      end: today
    });
  }, []);

  const calculateStreak = (completions: string[]) => {
    let streak = 0;
    let current = startOfToday();
    const sorted = [...completions].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    // Check if completed today or yesterday to keep streak alive
    const todayStr = format(current, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(current, 1), 'yyyy-MM-dd');
    
    if (!completions.includes(todayStr) && !completions.includes(yesterdayStr)) return 0;

    for (let i = 0; i < 365; i++) {
      const dStr = format(subDays(startOfToday(), i), 'yyyy-MM-dd');
      if (completions.includes(dStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <AppLayout>
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4">
              <Zap className="text-yellow-500" size={36} />
              Habit Tracker
            </h1>
            <p className="text-slate-400 font-medium">Maintain operational consistency through daily training routines.</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-6 px-8 rounded-2xl shadow-lg shadow-indigo-600/20">
                <Plus size={20} className="mr-2" /> New Routine
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-white">
              <DialogHeader><DialogTitle className="italic uppercase font-black">INITIALIZE ROUTINE</DialogTitle></DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Routine Name</Label>
                  <Input 
                    placeholder="e.g. 30m Aim Training" 
                    value={newHabit.name} 
                    onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                    className="bg-slate-900 border-slate-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Description (Optional)</Label>
                  <Input 
                    placeholder="e.g. Kovaaks or Aimlabs session" 
                    value={newHabit.description} 
                    onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                    className="bg-slate-900 border-slate-800"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddHabit} className="w-full bg-indigo-600 font-black uppercase py-6">START TRACKING</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {habits.length > 0 ? habits.map((habit) => {
            const streak = calculateStreak(habit.completions);
            return (
              <Card key={habit.id} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden group">
                <div className="h-1 w-full bg-slate-800 group-hover:bg-indigo-500/50 transition-colors" />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        streak > 0 ? "bg-orange-500/20 text-orange-500" : "bg-slate-800 text-slate-600"
                      )}>
                        <Flame size={24} className={cn(streak > 0 && "animate-pulse")} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{habit.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{habit.description || 'No description provided.'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Streak</p>
                        <p className="text-2xl font-black text-white tabular-nums">{streak} <span className="text-xs text-slate-600">DAYS</span></p>
                      </div>

                      <div className="flex items-center gap-2">
                        {last7Days.map((date) => {
                          const isCompleted = habit.completions.includes(format(date, 'yyyy-MM-dd'));
                          const isToday = isSameDay(date, startOfToday());
                          return (
                            <div key={date.toISOString()} className="flex flex-col items-center gap-2">
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-tighter",
                                isToday ? "text-indigo-400" : "text-slate-600"
                              )}>
                                {format(date, 'EEE')}
                              </span>
                              <button
                                onClick={() => toggleCompletion(habit.id, date)}
                                className={cn(
                                  "w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center",
                                  isCompleted 
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                                    : "bg-slate-950 border-slate-800 text-slate-700 hover:border-slate-600"
                                )}
                              >
                                {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-700 hover:text-red-500"
                        onClick={() => removeHabit(habit.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="p-20 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/20">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto mb-6 text-slate-700">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-300 mb-2">No Routines Defined</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm mb-8">Establish daily habits to sharpen your tactical edge and maintain peak performance.</p>
              <Button onClick={() => setIsAddOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 font-black px-8 py-6 rounded-2xl">
                Initialize First Habit
              </Button>
            </div>
          )}
        </div>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </AppLayout>
  );
};

export default HabitTracker;