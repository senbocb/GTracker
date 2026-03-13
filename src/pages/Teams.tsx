"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Shield, Plus, Users, Target, Globe, Settings, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { showSuccess } from '@/utils/toast';

const Teams = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teams, setTeams] = useState<any[]>([
    { id: '1', name: 'Alpha_Squad', members: 12, rank: 'Elite', description: 'Competitive tactical unit.' }
  ]);

  const handleCreateTeam = () => {
    showSuccess("Team initialized.");
    setIsCreateOpen(false);
  };

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4">
              <Shield className="text-indigo-500" size={36} />
              Team Operations
            </h1>
            <p className="text-slate-400 font-medium">Form tactical units and coordinate with other operators.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-6 px-8 rounded-2xl shadow-lg shadow-indigo-600/20">
            <Plus size={20} className="mr-2" /> Create Team
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <Card key={team.id} className="bg-slate-900/90 border-slate-800 group hover:border-indigo-500/50 transition-all overflow-hidden">
              <div className="h-1.5 w-full bg-indigo-600" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white">{team.name}</CardTitle>
                  <span className="px-2 py-0.5 rounded bg-indigo-600/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase">{team.rank}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">{team.description}</p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase">{team.members} Members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Active</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase h-9">View Intel</Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-white"><Settings size={18} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="italic uppercase font-black">Initialize Tactical Unit</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Team Name</Label>
                <Input placeholder="e.g. SQUAD_NAME" className="bg-slate-900 border-slate-800" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Description</Label>
                <Input placeholder="Team objectives..." className="bg-slate-900 border-slate-800" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTeam} className="w-full bg-indigo-600 font-black uppercase py-6">Confirm Deployment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AppLayout>
  );
};

export default Teams;