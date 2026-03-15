"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, History, Target, FileCode, User, Settings, 
  Bell, LogOut, Zap, ChevronLeft, ChevronRight, Users, Shield, Search, Terminal, Menu, X, GitBranch, Loader2, ArrowRight, Boxes, Tool
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ profiles: any[], teams: any[] }>({ profiles: [], teams: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        performSearch();
      } else {
        setSearchResults({ profiles: [], teams: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    setShowResults(true);
    try {
      const [profilesRes, teamsRes] = await Promise.all([
        supabase.from('profiles').select('*').ilike('username', `%${searchQuery}%`).limit(5),
        supabase.from('teams').select('*').or(`name.ilike.%${searchQuery}%,tag.ilike.%${searchQuery}%`).limit(5)
      ]);

      setSearchResults({
        profiles: profilesRes.data || [],
        teams: teamsRes.data || []
      });
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (type: 'profile' | 'team', id: string) => {
    setShowResults(false);
    setSearchQuery('');
    if (type === 'profile') navigate(`/social?q=${id}`);
    else navigate(`/teams?id=${id}`);
  };

  const navGroups = [
    {
      label: 'Command',
      items: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/' },
        { icon: <History size={18} />, label: 'History', path: '/history' },
        { icon: <Zap size={18} />, label: 'Habits', path: '/habits' },
      ]
    },
    {
      label: 'Intel',
      items: [
        { icon: <Users size={18} />, label: 'Social Hub', path: '/social' },
        { icon: <Shield size={18} />, label: 'Teams', path: '/teams' },
      ]
    },
    {
      label: 'Armory',
      items: [
        { icon: <Target size={18} />, label: 'Crosshairs', path: '/crosshairs' },
        { icon: <FileCode size={18} />, label: 'Configs', path: '/configs' },
      ]
    },
    {
      label: 'Personal',
      items: [
        { icon: <User size={18} />, label: 'Profile', path: '/profile' },
        { icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col md:flex-row">
      <aside className={cn(
        "hidden md:flex border-r border-slate-800 flex-col bg-slate-950/50 backdrop-blur-xl sticky top-0 h-screen z-50 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="p-6 mb-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <Terminal className="text-white" size={24} />
            </div>
            {!isCollapsed && <span className="text-xl font-black italic tracking-tighter text-white uppercase">GTracker</span>}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-500 hover:text-white"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              {!isCollapsed && (
                <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-3">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-4 h-10 rounded-xl transition-all group",
                        location.pathname === item.path 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" 
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      )}
                    >
                      <span className={cn(location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-indigo-400")}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="font-bold uppercase tracking-widest text-[10px]">{item.label}</span>}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link to="/version-history">
            <Button variant="ghost" className={cn(
              "w-full justify-start gap-4 h-10 rounded-xl",
              location.pathname === '/version-history' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            )}>
              <GitBranch size={18} />
              {!isCollapsed && <span className="font-bold uppercase tracking-widest text-[10px]">Versions</span>}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            onClick={signOut}
            className="w-full justify-start gap-4 h-10 text-slate-400 hover:text-red-400 rounded-xl"
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="font-bold uppercase tracking-widest text-[10px]">Logout</span>}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-20 border-b border-slate-800 items-center justify-between px-8 bg-slate-950/30 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-8 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Operator: <span className="text-white">{profile?.username || 'Authenticating...'}</span>
              </h2>
            </div>
            
            <div className="relative max-w-md w-full" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <Input 
                placeholder="Search operators, teams, intel..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                className="bg-slate-900/50 border-slate-800 pl-10 h-10 text-xs font-bold uppercase tracking-widest focus:ring-indigo-500"
              />
              
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {isSearching ? (
                    <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                      {searchResults.profiles.length > 0 && (
                        <div className="p-2">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Operators</p>
                          {searchResults.profiles.map(p => (
                            <button 
                              key={p.id} 
                              onClick={() => handleResultClick('profile', p.username)}
                              className="w-full flex items-center gap-3 p-2 hover:bg-slate-900 rounded-lg transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <User size={16} className="text-slate-500" />}
                              </div>
                              <span className="text-xs font-bold text-white">{p.username}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {searchResults.teams.length > 0 && (
                        <div className="p-2 border-t border-slate-800/50">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-3 py-2">Teams</p>
                          {searchResults.teams.map(t => (
                            <button 
                              key={t.id} 
                              onClick={() => handleResultClick('team', t.id)}
                              className="w-full flex items-center gap-3 p-2 hover:bg-slate-900 rounded-lg transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                                {t.icon_url ? <img src={t.icon_url} className="w-full h-full object-cover" /> : <Shield size={16} className="text-indigo-500" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-white">[{t.tag}] {t.name}</span>
                                <span className="text-[8px] text-slate-500 uppercase">{t.main_game || 'Multi-Game'}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.profiles.length === 0 && searchResults.teams.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 uppercase font-bold">No results found</div>
                      ) : (
                        <button 
                          onClick={() => navigate(`/social?q=${searchQuery}`)}
                          className="w-full p-3 bg-slate-900/50 hover:bg-slate-900 text-[10px] font-black uppercase text-indigo-400 flex items-center justify-center gap-2 border-t border-slate-800"
                        >
                          See all results <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white bg-slate-900/50 rounded-full">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-slate-950 border-slate-800 text-white p-0 overflow-hidden">
                <DropdownMenuLabel className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest">Notifications</span>
                </DropdownMenuLabel>
                <div className="p-8 text-center text-xs text-slate-500 uppercase font-bold">No new alerts</div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/profile">
              <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors">
                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-500" />}
              </div>
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;