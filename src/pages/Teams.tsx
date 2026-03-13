"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Shield, Plus, Users, Target, Globe, Settings, LogOut, Bell, MessageSquare, UserPlus, Search, Loader2, User, Camera, Lock, Unlock, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { processImage } from '@/utils/imageProcessing';

const Teams = () => {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', is_open: true, icon_url: '' });
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchInvites();
    }
  }, [user]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data: memberTeams } = await supabase
        .from('team_members')
        .select('team_id, teams(*, team_members(count), team_announcements(*))')
        .eq('user_id', user?.id);
      
      setTeams(memberTeams?.map(m => m.teams) || []);
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    const { data } = await supabase
      .from('team_invites')
      .select('*, team:teams(*)')
      .eq('invitee_id', user?.id)
      .eq('status', 'pending');
    if (data) setInvites(data);
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name) return;
    try {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({ 
          name: newTeam.name, 
          description: newTeam.description,
          leader_id: user?.id,
          is_open: newTeam.is_open,
          icon_url: newTeam.icon_url
        })
        .select()
        .single();
      
      if (teamError) throw teamError;

      await supabase.from('team_members').insert({ 
        team_id: team.id, 
        user_id: user?.id,
        role: 'Leader'
      });
      
      showSuccess("Team initialized.");
      setIsCreateOpen(false);
      fetchTeams();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, team_members(count)')
        .ilike('name', `%${search}%`);
      
      if (error) throw error;
      setTeams(data || []);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const processed = await processImage(file, 200, 200, 0.7);
      setNewTeam({ ...newTeam, icon_url: processed });
    }
  };

  const acceptInvite = async (invite: any) => {
    try {
      await supabase.from('team_members').insert({ team_id: invite.team_id, user_id: user?.id });
      await supabase.from('team_invites').delete().eq('id', invite.id);
      showSuccess("Joined team.");
      fetchInvites();
      fetchTeams();
    } catch (err: any) {
      showError(err.message);
    }
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
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <Input 
                placeholder="Search teams..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-slate-900 border-slate-800 pl-10 h-12 w-64"
              />
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-6 px-8 rounded-2xl shadow-lg shadow-indigo-600/20">
              <Plus size={20} className="mr-2" /> Create Team
            </Button>
          </div>
        </div>

        {invites.length > 0 && (
          <div className="mb-10 space-y-4">
            <h2 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Pending Invites</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {invites.map(invite => (
                <div key={invite.id} className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden">
                      {invite.team?.icon_url ? <img src={invite.team.icon_url} className="w-full h-full object-cover" /> : <Shield size={20} className="text-indigo-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase italic">{invite.team?.name}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Invited you to join</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => acceptInvite(invite)} className="bg-indigo-600 h-8 w-8 p-0"><Check size={16} /></Button>
                    <Button size="sm" variant="ghost" onClick={async () => { await supabase.from('team_invites').delete().eq('id', invite.id); fetchInvites(); }} className="h-8 w-8 p-0 text-slate-500 hover:text-red-500"><X size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!activeTeam ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
            ) : teams.length > 0 ? teams.map(team => (
              <Card key={team.id} className="bg-slate-900/90 border-slate-800 group hover:border-indigo-500/50 transition-all overflow-hidden cursor-pointer" onClick={() => setActiveTeam(team)}>
                <div className="h-1.5 w-full bg-indigo-600" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                        {team.icon_url ? <img src={team.icon_url} className="w-full h-full object-cover" /> : <Shield size={20} className="text-slate-600" />}
                      </div>
                      <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white">{team.name}</CardTitle>
                    </div>
                    {team.is_open ? <Unlock size={14} className="text-emerald-500" /> : <Lock size={14} className="text-slate-600" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{team.description}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase">{team.team_members?.[0]?.count || 0} Members</span>
                    </div>
                  </div>
                  <Button className="w-full bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase h-9">Enter Command Center</Button>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No teams found. Create one or search to join.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setActiveTeam(null)} className="text-slate-500 hover:text-white">
                  <Plus className="rotate-45" size={20} />
                </Button>
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                  {activeTeam.icon_url ? <img src={activeTeam.icon_url} className="w-full h-full object-cover" /> : <Shield size={24} className="text-indigo-500" />}
                </div>
                <h2 className="text-3xl font-black italic uppercase text-white">{activeTeam.name}</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-800 text-[10px] font-black uppercase"><UserPlus size={14} className="mr-2" /> Invite</Button>
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white"><Settings size={18} /></Button>
              </div>
            </div>

            <Tabs defaultValue="intel" className="w-full">
              <TabsList className="bg-slate-950 border border-slate-800 p-1 h-auto mb-6">
                <TabsTrigger value="intel" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Intel & Feed</TabsTrigger>
                <TabsTrigger value="roster" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Roster</TabsTrigger>
                <TabsTrigger value="comms" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Comms</TabsTrigger>
              </TabsList>

              <TabsContent value="intel" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Bell size={14} /> Announcements</h3>
                    {activeTeam.team_announcements?.length > 0 ? activeTeam.team_announcements.map((ann: any) => (
                      <Card key={ann.id} className="bg-slate-900/50 border-slate-800">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-black uppercase italic text-white">{ann.title}</h4>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">{new Date(ann.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-400">{ann.content}</p>
                        </CardContent>
                      </Card>
                    )) : (
                      <p className="text-xs text-slate-500 italic">No announcements yet.</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Target size={14} /> Team Stats</h3>
                    <Card className="bg-slate-900/50 border-slate-800">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between"><span className="text-[10px] font-bold text-slate-400 uppercase">Win Rate</span><span className="text-xs font-black text-emerald-400">68%</span></div>
                        <div className="flex justify-between"><span className="text-[10px] font-bold text-slate-400 uppercase">Avg Rank</span><span className="text-xs font-black text-indigo-400">Diamond II</span></div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="roster" className="space-y-4">
                <p className="text-xs text-slate-500 italic">Roster management coming soon.</p>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="italic uppercase font-black">Initialize Tactical Unit</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden group cursor-pointer" onClick={() => document.getElementById('team-icon')?.click()}>
                  {newTeam.icon_url ? <img src={newTeam.icon_url} className="w-full h-full object-cover" /> : <Camera size={32} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />}
                </div>
                <input id="team-icon" type="file" className="hidden" accept="image/*" onChange={handleIconUpload} />
                <p className="text-[10px] font-bold uppercase text-slate-500">Upload Clan Icon</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Team Name</Label>
                <Input 
                  placeholder="e.g. SQUAD_NAME" 
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  className="bg-slate-900 border-slate-800" 
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Description</Label>
                <Input 
                  placeholder="Team objectives..." 
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                  className="bg-slate-900 border-slate-800" 
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-white">Open Recruitment</Label>
                  <p className="text-[9px] text-slate-500 uppercase">Allow anyone to join without invite</p>
                </div>
                <Switch checked={newTeam.is_open} onCheckedChange={(v) => setNewTeam({...newTeam, is_open: v})} />
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