"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { CheckCircle2, Circle, Plus, Trash2, Flame, Calendar as CalendarIcon, BarChart3, Target, Zap, ChevronRight, ChevronLeft, Clock, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { format, startOfToday, eachDayOfInterval, subDays, isSameDay, addDays, differenceInDays, parseISO, isBefore, isAfter } from 'date-fns';

interface Habit {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  completions: string[]; // Array of ISO date strings (YYYY-MM-DD)
  duration?: '1w' | '1m' | '3m' | 'custom' | 'infinite';
  customDays?: number;
}

const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({ 
    name: '', 
    description: '', 
    duration: 'infinite',
    customDays: 30
  });

  const [calendarOpenId, setCalendarOpenId] = useState<string | null>(null);

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
      description: newHabit.description || '',
      createdAt: new Date().toISOString(),
      completions: [],
      duration: newHabit.duration as any,
      customDays: newHabit.customDays
    };
    saveHabits([habit, ...habits]);
    setNewHabit({ name: '', description: '', duration: 'infinite', customDays: 30 });
    setIsAddOpen(false);
    showSuccess(`Mission "${habit.name}" initialized.`);
  };

  const toggleCompletion = (habitId: string, date: Date) => {
    // Prevent future logging
    if (isAfter(date, startOfToday())) {
      showError("Cannot log future operations.");
      return;
    }

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
    showSuccess("Mission decommissioned.");
  };

  // Row starts with Today and finishes the next 6 days
  const next7Days = useMemo(() => {
    const today = startOfToday();
    return eachDayOfInterval({
      start: today,
      end: addDays(today, 6)
    });
  }, []);

  const calculateStreak = (completions: string[]) => {
    let streak = 0;
    const today = startOfToday();
    
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    
    // Streak is only active if today or yesterday was completed
    if (!completions.includes(todayStr) && !completions.includes(yesterdayStr)) return 0;

    for (let i = 0; i < 365; i++) {
      const dStr = format(subDays(today, i), 'yyyy-MM-dd');
      if (completions.includes(dStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getMissionProgress = (habit: Habit) => {
    if (!habit.duration || habit.duration === 'infinite') return null;
    
    let totalDays = 0;
    switch (habit.duration) {
      case '1w': totalDays = 7; break;
      case '1m': totalDays = 30; break;
      case '3m': totalDays = 90; break;
      case 'custom': totalDays = habit.customDays || 30; break;
    }

    const startDate = parseISO(habit.createdAt);
    const today = startOfToday();
    
    const daysPassed = Math.max(0, differenceInDays(today, startDate));
    const daysRemaining = Math.max(0, totalDays - daysPassed);
    const completionRate = Math.min(100, (habit.completions.length / totalDays) * 100);

    return {
      totalDays,
      daysRemaining,
      completionRate,
      isComplete: daysRemaining === 0
    };
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
                <Plus size={20} className="mr-2" /> New Mission
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-white">
              <DialogHeader><DialogTitle className="italic uppercase font-black">INITIALIZE MISSION</DialogTitle></DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Mission Name</Label>
                  <Input 
                    placeholder="e.g. 30m Aim Training" 
                    value={newHabit.name} 
                    onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                    className="bg-slate-900 border-slate-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Mission Duration</Label>
                  <Select 
                    value={newHabit.duration} 
                    onValueChange={(v: any) => setNewHabit({...newHabit, duration: v})}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="infinite">Ongoing Operation</SelectItem>
                      <SelectItem value="1w">1 Week Sprint</SelectItem>
                      <SelectItem value="1m">1 Month Campaign</SelectItem>
                      <SelectItem value="3m">3 Month Deployment</SelectItem>
                      <SelectItem value="custom">Custom Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newHabit.duration === 'custom' && (
                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Total Days</Label>
                    <Input 
                      type="number"
                      value={newHabit.customDays} 
                      onChange={(e) => setNewHabit({...newHabit, customDays: parseInt(e.target.value)})}
                      className="bg-slate-900 border-slate-800"
                    />
                  </div>
                )}
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
                <Button onClick={handleAddHabit} className="w-full bg-indigo-600 font-black uppercase py-6">START MISSION</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {habits.length > 0 ? habits.map((habit) => {
            const streak = calculateStreak(habit.completions);
            const mission = getMissionProgress(habit);
            
            return (
              <Card key={habit.id} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden group">
                <div className={cn(
                  "h-1 w-full transition-colors",
                  streak > 0 ? "bg-indigo-500" : "bg-slate-800"
                )} />
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Info Section */}
                    <div className="flex-1 flex items-start gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0",
                        streak > 0 ? "bg-orange-500/20 text-orange-500" : "bg-slate-800 text-slate-600"
                      )}>
                        <Flame size={28} className={cn(streak > 0 && "animate-pulse")} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tight truncate">{habit.name}</h3>
                        <p className="text-xs text-slate-500 font-medium mb-4">{habit.description || 'No description provided.'}</p>
                        
                        {mission && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-400">Mission Progress</span>
                              <span className="text-indigo-400">{Math.round(mission.completionRate)}% Efficiency</span>
                            </div>
                            <Progress value={mission.completionRate} className="h-1.5 bg-slate-950" />
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase">
                                <Clock size={10} />
                                {mission.daysRemaining} Days Left
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase">
                                <Trophy size={10} />
                                {habit.completions.length} / {mission.totalDays} Completed
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controls Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Streak</p>
                        <p className="text-3xl font-black text-white tabular-nums">{streak} <span className="text-xs text-slate-600">DAYS</span></p>
                      </div>

                      <div className="flex items-center gap-2">
                        {next7Days.map((date) => {
                          const isCompleted = habit.completions.includes(format(date, 'yyyy-MM-dd'));
                          const isToday = isSameDay(date, startOfToday());
                          const isFuture = isAfter(date, startOfToday());
                          
                          return (
                            <div key={date.toISOString()} className="flex flex-col items-center gap-2">
                              <div className="text-center mb-1">
                                <p className={cn(
                                  "text-[8px] font-black uppercase tracking-tighter",
                                  isToday ? "text-indigo-400" : "text-slate-600"
                                )}>
                                  {format(date, 'EEE')}
                                </p>
                                <p className="text-[7px] font-bold text-slate-700">{format(date, 'MM/dd')}</p>
                              </div>
                              <button
                                onClick={() => !isFuture && toggleCompletion(habit.id, date)}
                                disabled={isFuture}
                                className={cn(
                                  "w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center",
                                  isCompleted 
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                                    : isFuture 
                                      ? "bg-slate-950/50 border-slate-900 text-slate-800 cursor-not-allowed"
                                      : "bg-slate-950 border-slate-800 text-slate-700 hover:border-slate-600"
                                )}
                              >
                                {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 border-l border-slate-800 pl-6">
                        <Dialog open={calendarOpenId === habit.id} onOpenChange={(v) => setCalendarOpenId(v ? habit.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-800 bg-slate-950 text-slate-400 hover:text-white">
                              <CalendarIcon size={18} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[400px]">
                            <DialogHeader><DialogTitle className="italic uppercase font-black">MISSION LOG: {habit.name}</DialogTitle></DialogHeader>
                            <div className="p-4 flex justify-center">
                              <Calendar
                                mode="multiple"
                                selected={habit.completions.map(d => parseISO(d))}
                                onSelect={(dates) => {
                                  const today = startOfToday();
                                  const validDates = (dates || []).filter(d => !isAfter(d, today));
                                  const formatted = validDates.map(d => format(d, 'yyyy-MM-dd'));
                                  const updated = habits.map(h => h.id === habit.id ? { ...h, completions: formatted } : h);
                                  saveHabits(updated);
                                }}
                                modifiers={{
                                  completed: (date) => habit.completions.includes(format(date, 'yyyy-MM-dd')),
                                  missed: (date) => isBefore(date, startOfToday()) && !habit.completions.includes(format(date, 'yyyy-MM-dd'))
                                }}
                                modifiersClassNames={{
                                  completed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-md",
                                  missed: "bg-red-500/10 text-red-400/50 border border-red-500/20 rounded-md"
                                }}
                                className="rounded-md border border-slate-800 bg-slate-900"
                              />
                            </div>
                            <div className="px-6 pb-6 space-y-4">
                              <div className="flex items-center justify-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50" />
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">Done</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded bg-red-500/10 border border-red-500/20" />
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">Missed</span>
                                </div>
                              </div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                Select dates to toggle completion status in the mission log.
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-slate-700 hover:text-red-500"
                          onClick={() => removeHabit(habit.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
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
              <h3 className="text-xl font-bold text-slate-300 mb-2">No Missions Defined</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm mb-8">Establish daily habits to sharpen your tactical edge and maintain peak performance.</p>
              <Button onClick={() => setIsAddOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 font-black px-8 py-6 rounded-2xl">
                Initialize First Mission
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