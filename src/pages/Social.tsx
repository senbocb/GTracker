"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Added missing import
import { 
  Users, Search, Shield, Trophy, Target, Zap, 
  UserPlus, MessageSquare, Filter, ArrowRight, 
  Loader2, User, Check, X, Globe, Gamepad2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

const Social = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [operators, setOperators] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('operators');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'operators') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(20);
        if (error) throw error;
        setOperators(data || []);
      } else {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .limit(20);
        if (error) throw error;
        setTeams(data || []);
      }
    } catch (err) {
      console.error("Error fetching social data:", err);
      toast.error("Failed to load social hub");
    } finally {
      setLoading(false);
    }
  };

  const filteredOperators = operators.filter(op => 
    op.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeams = teams.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.tag?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
            <Users className="text-indigo-500" size={32} />
            Social Hub
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Connect with other operators and elite squads</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input 
            placeholder="Search operators or teams..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900/50 border-slate-800 pl-10 h-12 text-xs font-bold uppercase tracking-widest focus:ring-indigo-500"
          />
        </div>
      </div>

      <Tabs defaultValue="operators" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/50 border border-slate-800 p-1 h-12">
          <TabsTrigger value="operators" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-8 text-[10px] font-black uppercase tracking-widest">
            Operators
          </TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-8 text-[10px] font-black uppercase tracking-widest">
            Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operators" className="mt-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredOperators.map((op) => (
                <div key={op.id} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-indigo-500 transition-colors">
                      {op.avatar_url ? (
                        <img src={op.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <User size={32} className="text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">{op.username}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[8px] font-black uppercase">
                          Level {op.level || 1}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span>Main Game</span>
                      <span className="text-white">{op.main_game || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span>Region</span>
                      <span className="text-white">{op.region || 'Global'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/profile?id=${op.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-slate-800 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest h-10">
                        View Intel
                      </Button>
                    </Link>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-3">
                      <UserPlus size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="teams" className="mt-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <div key={team.id} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-indigo-500 transition-colors">
                      {team.icon_url ? (
                        <img src={team.icon_url} className="w-full h-full object-cover" />
                      ) : (
                        <Shield size={32} className="text-indigo-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-400 font-black text-sm">[{team.tag}]</span>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{team.name}</h3>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{team.main_game || 'Multi-Game'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-6 h-8">
                    {team.description || 'No description provided for this squad.'}
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                          <User size={14} className="text-slate-500" />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center text-[8px] font-black text-slate-500">
                        +12
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-black uppercase">
                      Recruiting
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/teams?id=${team.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-slate-800 hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest h-10">
                        Squad Intel
                      </Button>
                    </Link>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-4 text-[10px] font-black uppercase tracking-widest">
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Social;