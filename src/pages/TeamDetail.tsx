"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { 
  Shield, Users, MessageSquare, Settings, LogOut, Trash2, 
  ChevronLeft, User, Crown, Calendar, Globe, Lock, Unlock,
  AlertTriangle, Loader2, Check, X, Plus, Camera, ImageIcon, Gamepad2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { showSuccess, showError } from '@/utils/toast';
import { processImage } from '@/utils/imageProcessing';
import { cn } from '@/lib/utils';

const VERIFIED_GAMES = ["Valorant", "Counter-Strike 2", "League of Legends", "Overwatch 2", "Apex Legends", "Aim Lab", "Kovaaks"];

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editedTeam, setEditedTeam] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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
      setEditedTeam({ ...teamData });

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
      // Delete members first due to foreign key constraints
      await supabase.from('team_members').delete().eq('team_id', team.id);
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

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: editedTeam.name,
          tag: editedTeam.tag,
          description: editedTeam.description,
          is_open: editedTeam.is_open,
          main_game: editedTeam.main_game,
          icon_url: editedTeam.icon_url,
          banner_url: editedTeam.banner_url
        })
        .eq('id', team.id);
      
      if (error) throw error;
      showSuccess("Team settings updated.");
      setIsSettingsOpen(false);
      fetchTeamData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImage(file, type === 'icon' ? 400 : 1920, type === 'icon' ? 400 : 600, 0.8);
        setEditedTeam({ ...editedTeam, [type === 'icon' ? 'icon_url' : 'banner_url']: processed });
        showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} processed.`);
      } catch (err) {
        showError("Failed to process image.");
      }
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);
      
      if (error) throw error;
      showSuccess("Member role updated.");
      fetchTeamData();
    } catch (err: any) {
      showError(err.message);
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
            {isLeader && (
              <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="border-slate-800 text-slate-400 hover:text-white">
                <Settings size={18} className="mr-2" /> Team Settings
              </Button>
            )}
            {!isLeader && (
              <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-red-400">
                <LogOut size={18} className="mr-2" /> Leave Team
              </Button>
            )}
          </div>
        </div>

        <div className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden border border-slate-800 bg-slate-900 mb-10">
          {team.banner_url ? (
            <img src={team.banner_url} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-900/40 to-violet-900/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
          <div className="absolute -bottom-1 left-10 flex items-end gap-6">
            <div className="w-32 h-32 rounded-[2rem] bg-slate-800 border-8 border-[#020617] flex items-center justify-center overflow-hidden shadow-2xl">
              {team.icon_url ? <img src={team.icon_url} className="w-full h-full object-cover" /> : <Shield size={48} className="text-indigo-500" />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
                      {isLeader && member.user_id !== user?.id && (
                        <Select value={member.role} onValueChange={(v) => updateMemberRole(member.id, v)}>
                          <SelectTrigger className="w-24 h-8 bg-slate-950 border-slate-800 text-[9px] font-black uppercase">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-800 text-white">
                            <SelectItem value="Leader">Leader</SelectItem>
                            <SelectItem value="Officer">Officer</SelectItem>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Recruit">Recruit</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
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

        {/* Team Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="italic uppercase font-black">Team Configuration</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Team Name</Label>
                    <Input value={editedTeam?.name} onChange={(e) => setEditedTeam({...editedTeam, name: e.target.value})} className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Tag</Label>
                    <Input value={editedTeam?.tag} onChange={(e) => setEditedTeam({...editedTeam, tag: e.target.value.toUpperCase()})} maxLength={4} className="bg-slate-900 border-slate-800" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Main Game</Label>
                    <Select value={editedTeam?.main_game} onValueChange={(v) => setEditedTeam({...editedTeam, main_game: v})}>
                      <SelectTrigger className="bg-slate-900 border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {VERIFIED_GAMES.map(game => (
                          <SelectItem key={game} value={game}>{game}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Team Icon</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                        {editedTeam?.icon_url ? <img src={editedTeam.icon_url} className="w-full h-full object-cover" /> : <Shield size={24} className="text-slate-600" />}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => iconInputRef.current?.click()} className="border-slate-800 bg-slate-900/50">Change</Button>
                      <input type="file" ref={iconInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'icon')} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Team Banner</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                        {editedTeam?.banner_url ? <img src={editedTeam.banner_url} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-600" />}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => bannerInputRef.current?.click()} className="border-slate-800 bg-slate-900/50">Change</Button>
                      <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Description</Label>
                <Textarea value={editedTeam?.description} onChange={(e) => setEditedTeam({...editedTeam, description: e.target.value})} className="bg-slate-900 border-slate-800 min-h-[100px]" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Open Recruitment</Label>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Allow anyone to join without invite</p>
                </div>
                <Switch checked={editedTeam?.is_open} onCheckedChange={(v) => setEditedTeam({...editedTeam, is_open: v})} />
              </div>

              <div className="pt-6 border-t border-slate-800">
                <Button variant="destructive" onClick={handleDeleteTeam} disabled={isDeleting} className="w-full bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white h-12 font-black uppercase">
                  {isDeleting ? <Loader2 className="animate-spin mr-2" /> : <Trash2 size={18} className="mr-2" />} Decommission Team
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full bg-indigo-600 font-black uppercase py-6">
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : "Save Configuration"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AppLayout>
  );
};

export default TeamDetail;