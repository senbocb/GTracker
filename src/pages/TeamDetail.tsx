"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { 
  Shield, Users, MessageSquare, Settings, LogOut, Trash2, 
  ChevronLeft, User, Crown, Calendar, Globe, Lock, Unlock,
  AlertTriangle, Loader2, Check, X, Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchTeamData();
  }, [id]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();
      
      if (teamError) throw teamError;
      setTeam(teamData);

      // Fetch members and then their profiles separately to avoid relationship cache errors
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', id);
      
      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const userIds = memberData.map(m => m.user_id);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);
        
        const membersWithProfiles = memberData.map(m => ({
          ...m,
          profiles: profileData?.find(p => p.id === m.user_id)
        }));
        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (err: any) {
      showError(err.message);
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team || team.leader_id !== user?.id) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('teams').delete().eq('id', team.id);
      if (error) throw error;
      showSuccess("Team decommissioned.");
      navigate('/teams');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-indigo-500" size={40} /></div></AppLayout>;
  if (!team) return null;

  const isLeader = team.leader_id === user?.id;

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto p-4 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/teams">
            <Button variant="ghost" className="text-slate-400 hover:text-white -ml-4">
              <ChevronLeft className="mr-2" /> Back to Operations
            </Button>
          </Link>
          <div className="flex gap-3">
            {isLeader ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white">
                    <Trash2 size={18} className="mr-2" /> Delete Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-950 border-slate-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-red-500 flex items-center gap-2 uppercase italic font-black">
                      <AlertTriangle /> Critical Authorization
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <p className="text-sm text-slate-300">This will permanently dissolve <span className="text-white font-bold">[{team.tag}] {team.name}</span> and remove all members.</p>
                  </div>
                  <DialogFooter>
                    <Button variant="destructive" onClick={handleDeleteTeam} disabled={isDeleting} className="w-full bg-red-600 font-black uppercase py-6">
                      {isDeleting ? <Loader2 className="animate-spin mr-2" /> : "Confirm Dissolution"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-red-400">
                <LogOut size={18} className="mr-2" /> Leave Team
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
                {team.icon_url ? <img src={team.icon_url} className="w-full h-full object-cover" /> : <Shield size={48} className="text-indigo-500" />}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                    <span className="text-indigo-400">[{team.tag}]</span> {team.name}
                  </h1>
                  {team.is_open ? <Unlock size={16} className="text-emerald-500" /> : <Lock size={16} className="text-slate-500" />}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">{team.main_game || 'Multi-Game'}</Badge>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Users size={12} /> {members.length} Operators
                  </span>
                </div>
              </div>
            </div>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader><CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Operational Directive</CardTitle></CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{team.description || 'No description provided for this unit.'}</p>
              </CardContent>
            </Card>

            <Tabs defaultValue="roster">
              <TabsList className="bg-slate-950 border border-slate-800 p-1 h-auto mb-6">
                <TabsTrigger value="roster" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Roster</TabsTrigger>
                <TabsTrigger value="intel" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Intel Feed</TabsTrigger>
              </TabsList>

              <TabsContent value="roster" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                          {member.profiles?.avatar_url ? <img src={member.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase italic">{member.profiles?.username}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            {member.role === 'Leader' ? <Crown size={10} className="text-yellow-500" /> : <Shield size={10} />}
                            {member.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="intel">
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                  <MessageSquare size={32} className="mx-auto text-slate-700 mb-4" />
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No recent intel reports</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader><CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Unit Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Established</span>
                  <span className="text-[10px] font-mono text-white">{new Date(team.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-black uppercase">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default TeamDetail;