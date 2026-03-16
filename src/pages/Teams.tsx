"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Shield, Plus, Users, Target, Globe, Settings, LogOut, Bell, MessageSquare, UserPlus, Search, Loader2, User, Camera, Lock, Unlock, Check, X, Gamepad2, Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { processImage } from '@/utils/imageProcessing';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 12;
const VERIFIED_GAMES = ["Valorant", "Counter-Strike 2", "League of Legends", "Overwatch 2", "Apex Legends", "Aim Lab", "Kovaaks"];

const Teams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [discoverTeams, setDiscoverTeams] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [newTeam, setNewTeam] = useState({ name: '', tag: '', description: '', is_open: true, icon_url: '', main_game: '' });
  const [invites, setInvites] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyTeams();
      fetchDiscoverTeams();
      fetchInvites();
    }
  }, [user, page]);

  const fetchMyTeams = async () => {
    const { data: memberTeams } = await supabase
      .from('team_members')
      .select('team_id, is_primary, teams(*, team_members(count, user_id, role, is_primary))')
      .eq('user_id', user?.id);
    
    const formatted = memberTeams?.map(m => ({
      ...m.teams,
      is_primary: m.is_primary,
      member_role: m.teams.team_members.find((tm: any) => tm.user_id === user?.id)?.role
    })) || [];
    
    setTeams(formatted);
  };

  const fetchDiscoverTeams = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('teams')
        .select('*, team_members(count)', { count: 'exact' });
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,tag.ilike.%${search}%`);
      }

      const { data, count, error } = await query
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDiscoverTeams(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      showError(err.message);
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
    if (!newTeam.name || !newTeam.tag) return;
    setIsSubmitting(true);
    try {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({ 
          name: newTeam.name, 
          tag: newTeam.tag.toUpperCase(),
          description: newTeam.description,
          leader_id: user?.id,
          is_open: newTeam.is_open,
          icon_url: newTeam.icon_url,
          main_game: newTeam.main_game
        })
        .select()
        .single();
      
      if (teamError) throw teamError;

      await supabase.from('team_members').insert({ 
        team_id: team.id, 
        user_id: user?.id,
        role: 'Leader',
        is_primary: teams.length === 0
      });
      
      showSuccess("Team initialized.");
      setIsCreateOpen(false);
      fetchMyTeams();
      fetchDiscoverTeams();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto p-4 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4">
              <Shield className="text-indigo-500" size={36} />
              Team Operations
            </h1>
            <p className="text-slate-400 font-medium">Form tactical units and coordinate with other operators.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <Input 
                placeholder="Search teams..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDiscoverTeams()}
                className="bg-slate-900 border-slate-800 pl-10 h-12 w-full sm:w-64"
              />
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-6 px-8 rounded-2xl shadow-lg shadow-indigo-600/20">
              <Plus size={20} className="mr-2" /> Create Team
            </Button>
          </div>
        </div>

        <Tabs defaultValue="my-teams" className="w-full">
          <TabsList className="bg-slate-950 border border-slate-800 p-1 h-auto mb-8">
            <TabsTrigger value="my-teams" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">My Units</TabsTrigger>
            <TabsTrigger value="discover" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Discover Teams</TabsTrigger>
            <TabsTrigger value="invites" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">
              Invites {invites.length > 0 && <span className="ml-2 bg-red-500 text-white px-1.5 rounded-full text-[8px]">{invites.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-teams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => (
                <Card key={team.id} className={cn(
                  "bg-slate-900/90 border-slate-800 group hover:border-indigo-500/50 transition-all overflow-hidden cursor-pointer",
                  team.is_primary && "border-indigo-500/50 ring-1 ring-indigo-500/20"
                )} onClick={() => navigate(`/team/${team.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                        {team.icon_url ? <img src={team.icon_url} className="w-full h-full object-cover" /> : <Shield size={20} className="text-slate-600" />}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white">
                          <span className="text-indigo-400">[{team.tag}]</span> {team.name}
                        </CardTitle>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{team.main_game || 'Multi-Game'}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{team.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{team.team_members?.[0]?.count || 0} Members</span>
                      {team.is_primary && <span className="text-[8px] font-black bg-indigo-600 px-2 py-0.5 rounded text-white uppercase">Primary</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
              ) : discoverTeams.map(team => (
                <Card key={team.id} className="bg-slate-900/90 border-slate-800 group hover:border-indigo-500/50 transition-all overflow-hidden cursor-pointer" onClick={() => navigate(`/team/${team.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                        {team.icon_url ? <img src={team.icon_url} className="w-full h-full object-cover" /> : <Shield size={20} className="text-slate-600" />}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white">
                          <span className="text-indigo-400">[{team.tag}]</span> {team.name}
                        </CardTitle>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{team.main_game || 'Multi-Game'}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{team.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{team.team_members?.[0]?.count || 0} Members</span>
                      <Button size="sm" className="bg-indigo-600 h-8 text-[10px] font-black uppercase">View Team</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8">
                <Button 
                  variant="outline" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="border-slate-800 bg-slate-900/50"
                >
                  <ChevronLeft size={18} />
                </Button>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Page {page} of {totalPages}</span>
                <Button 
                  variant="outline" 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => p + 1)}
                  className="border-slate-800 bg-slate-900/50"
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="invites" className="space-y-4">
            {invites.length > 0 ? invites.map(invite => (
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
                  <Button size="sm" onClick={() => {}} className="bg-indigo-600 h-8 w-8 p-0"><Check size={16} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => {}} className="h-8 w-8 p-0 text-slate-500 hover:text-red-400"><X size={16} /></Button>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No pending invites</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Team Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-md w-[95vw]">
            <DialogHeader><DialogTitle className="italic uppercase font-black">Initialize Tactical Unit</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Team Name</Label>
                  <Input placeholder="e.g. SQUAD_NAME" value={newTeam.name} onChange={(e) => setNewTeam({...newTeam, name: e.target.value})} className="bg-slate-900 border-slate-800" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Tag</Label>
                  <Input placeholder="TAG" maxLength={4} value={newTeam.tag} onChange={(e) => setNewTeam({...newTeam, tag: e.target.value})} className="bg-slate-900 border-slate-800 uppercase" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Main Game</Label>
                <Select value={newTeam.main_game} onValueChange={(v) => setNewTeam({...newTeam, main_game: v})}>
                  <SelectTrigger className="bg-slate-900 border-slate-800">
                    <SelectValue placeholder="Select Primary Game" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    {VERIFIED_GAMES.map(game => (
                      <SelectItem key={game} value={game}>{game}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Description</Label>
                <Input placeholder="Team objectives..." value={newTeam.description} onChange={(e) => setNewTeam({...newTeam, description: e.target.value})} className="bg-slate-900 border-slate-800" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTeam} disabled={isSubmitting} className="w-full bg-indigo-600 font-black uppercase py-6">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Confirm Deployment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AppLayout>
  );
};

export default Teams;