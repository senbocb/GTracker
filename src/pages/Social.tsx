"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Search, UserPlus, UserCheck, UserX, MessageSquare, User, Shield, Star, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Social = () => {
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [discover, setDiscover] = useState<any[]>([]);

  useEffect(() => {
    setFriends([
      { id: '1', username: 'Ghost_Operator', status: 'online', level: 24, following: true },
      { id: '2', username: 'Viper_Squad', status: 'offline', level: 18, following: false }
    ]);
    setRequests([
      { id: '3', username: 'New_Recruit', level: 1 }
    ]);
    setDiscover([
      { id: '4', username: 'Elite_Sniper', level: 45, rank: 'Radiant' },
      { id: '5', username: 'Tactical_Mind', level: 32, rank: 'Global Elite' },
      { id: '6', username: 'Aim_God', level: 50, rank: 'Celestial' }
    ]);
  }, []);

  const handleAccept = (id: string) => {
    showSuccess("Friend request accepted.");
    setRequests(requests.filter(r => r.id !== id));
  };

  const handleFollow = (username: string) => {
    showSuccess(`Now following ${username}.`);
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <Input 
                placeholder="Search operators by username..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900 border-slate-800 pl-10 h-12 text-white"
              />
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
                {friends.map(friend => (
                  <div key={friend.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative">
                        <User size={24} className="text-slate-600" />
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900",
                          friend.status === 'online' ? "bg-emerald-500" : "bg-slate-600"
                        )} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{friend.username}</h3>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Level {friend.level} Operator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white"><MessageSquare size={18} /></Button>
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-400"><UserX size={18} /></Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="discover" className="space-y-4">
                {discover.map(user => (
                  <div key={user.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                        <User size={24} className="text-slate-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{user.username}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Level {user.level}</span>
                          <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">{user.rank}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-slate-800 text-[10px] font-black uppercase" onClick={() => handleFollow(user.username)}>
                        <Star size={14} className="mr-2" /> Follow
                      </Button>
                      <Button size="sm" className="bg-indigo-600 text-[10px] font-black uppercase">
                        <UserPlus size={14} className="mr-2" /> Request
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                {requests.map(req => (
                  <div key={req.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                        <UserPlus size={24} className="text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{req.username}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incoming Request</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleAccept(req.id)} className="bg-indigo-600 hover:bg-indigo-500 h-9 px-4 text-[10px] font-black uppercase"><UserCheck size={14} className="mr-2" /> Accept</Button>
                      <Button variant="ghost" className="text-slate-500 hover:text-red-400 h-9 px-4 text-[10px] font-black uppercase">Decline</Button>
                    </div>
                  </div>
                ))}
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