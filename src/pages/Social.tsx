"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Search, UserPlus, UserCheck, UserX, MessageSquare, User, Shield, Star, Eye, Loader2, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const Social = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [discover, setDiscover] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSocialData();
    }
  }, [user]);

  const fetchSocialData = async () => {
    setLoading(true);
    try {
      // Fetch Friends
      const { data: friendsData } = await supabase
        .from('friends')
        .select('friend_id, profiles!friends_friend_id_fkey(*)')
        .eq('user_id', user?.id);
      
      setFriends(friendsData?.map(f => f.profiles) || []);

      // Fetch Incoming Requests
      const { data: requestsData } = await supabase
        .from('friend_requests')
        .select('*, sender:profiles!friend_requests_sender_id_fkey(*)')
        .eq('receiver_id', user?.id)
        .eq('status', 'pending');
      
      setRequests(requestsData || []);
    } catch (err) {
      console.error("Error fetching social data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${search}%`)
        .neq('id', user?.id)
        .limit(10);
      
      if (error) throw error;
      setDiscover(data || []);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (receiverId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({ sender_id: user?.id, receiver_id: receiverId });
      
      if (error) {
        if (error.code === '23505') throw new Error("Request already pending.");
        throw error;
      }
      showSuccess("Friend request sent.");
    } catch (err: any) {
      showError(err.message);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('accept_friend_request', { request_id: requestId });
      if (error) throw error;
      showSuccess("Friend request accepted.");
      fetchSocialData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const declineRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);
      
      if (error) throw error;
      showSuccess("Request declined.");
      fetchSocialData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const unfriend = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${user?.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user?.id})`);
      
      if (error) throw error;
      showSuccess("Friend removed.");
      fetchSocialData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4">
            <MessageSquare className="text-indigo-500" size={36} />
            Social Hub
          </h1>
          <p className="text-slate-400 font-medium">Connect with other operators and discover the community.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <Input 
                  placeholder="Search operators by username..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-slate-900 border-slate-800 pl-10 h-12 text-white"
                />
              </div>
              <Button onClick={handleSearch} disabled={searching} className="bg-indigo-600 h-12 px-6">
                {searching ? <Loader2 className="animate-spin" /> : "Search"}
              </Button>
            </div>

            <Tabs defaultValue="friends" className="w-full">
              <TabsList className="bg-slate-950 border border-slate-800 p-1 h-auto mb-6">
                <TabsTrigger value="friends" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Friends</TabsTrigger>
                <TabsTrigger value="discover" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Discover</TabsTrigger>
                <TabsTrigger value="requests" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">
                  Requests {requests.length > 0 && <span className="ml-2 bg-red-500 text-white px-1.5 rounded-full text-[8px]">{requests.length}</span>}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="friends" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
                ) : friends.length > 0 ? friends.map(friend => (
                  <div key={friend.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                        {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-600" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{friend.username}</h3>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Level {Math.floor((friend.xp || 0) / 100) + 1} Operator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white"><MessageSquare size={18} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => unfriend(friend.id)} className="text-slate-500 hover:text-red-400"><UserX size={18} /></Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No friends added yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="discover" className="space-y-4">
                {discover.length > 0 ? discover.map(user => (
                  <div key={user.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-600" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{user.username}</h3>
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Level {Math.floor((user.xp || 0) / 100) + 1}</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => sendRequest(user.id)} className="bg-indigo-600 text-[10px] font-black uppercase">
                      <UserPlus size={14} className="mr-2" /> Request
                    </Button>
                  </div>
                )) : (
                  <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Search for operators to discover them</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                {requests.length > 0 ? requests.map(req => (
                  <div key={req.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                        {req.sender?.avatar_url ? <img src={req.sender.avatar_url} className="w-full h-full object-cover" /> : <UserPlus size={24} className="text-indigo-500" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{req.sender?.username}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incoming Request</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => acceptRequest(req.id)} className="bg-indigo-600 hover:bg-indigo-500 h-9 px-4 text-[10px] font-black uppercase"><UserCheck size={14} className="mr-2" /> Accept</Button>
                      <Button variant="ghost" onClick={() => declineRequest(req.id)} className="text-slate-500 hover:text-red-400 h-9 px-4 text-[10px] font-black uppercase">Decline</Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No pending requests</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Shield size={16} className="text-indigo-500" />
                  Suggested Teams
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer group">
                  <h4 className="text-xs font-black text-white uppercase italic">Alpha_Squad</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">12 Members • Active</p>
                </div>
                <Button variant="outline" className="w-full border-slate-800 bg-slate-950 text-[10px] font-black uppercase tracking-widest">View All Teams</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default Social;