"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, History, Target, FileCode, User, Settings, 
  Bell, LogOut, Zap, ChevronLeft, ChevronRight, Users, Shield 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const VERSION_HISTORY = [
  { version: "v2.5", type: "Update", title: "Social & Teams", date: "Today", notes: "Added Social tab with friend requests and Team management." },
  { version: "v2.4", type: "Update", title: "Auth & PIN Security", date: "Yesterday", notes: "Implemented Supabase auth with mandatory PIN security." }
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/login' && location.pathname !== '/reset-password') {
      navigate('/login');
    }

    // Fallback: Ensure profile exists if user is logged in
    if (user) {
      const checkProfile = async () => {
        const { data, error } = await supabase.from('profiles').select('id').eq('id', user.id).single();
        if (error || !data) {
          console.log("Profile missing, re-creating...");
          await supabase.from('profiles').upsert({
            id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0],
            xp: 0
          });
        }
      };
      checkProfile();
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-indigo-500 font-black italic uppercase">Initializing System...</div>;
  if (!user && location.pathname !== '/login' && location.pathname !== '/reset-password') return null;

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <History size={20} />, label: 'History', path: '/history' },
    { icon: <Zap size={20} />, label: 'Habits', path: '/habits' },
    { icon: <Users size={20} />, label: 'Social', path: '/social' },
    { icon: <Shield size={20} />, label: 'Teams', path: '/teams' },
    { icon: <Target size={20} />, label: 'Crosshairs', path: '/crosshairs' },
    { icon: <FileCode size={20} />, label: 'Configs', path: '/configs' },
    { icon: <User size={20} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex">
      <aside className={cn(
        "border-r border-slate-800 flex flex-col bg-slate-950/50 backdrop-blur-xl sticky top-0 h-screen z-50 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="p-6 mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <Target className="text-white" size={24} />
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

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-4 h-12 rounded-xl transition-all group",
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
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link to="/settings">
            <Button variant="ghost" className="w-full justify-start gap-4 h-12 text-slate-400 hover:text-white rounded-xl">
              <Settings size={20} />
              {!isCollapsed && <span className="font-bold uppercase tracking-widest text-[10px]">Settings</span>}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            onClick={signOut}
            className="w-full justify-start gap-4 h-12 text-slate-400 hover:text-red-400 rounded-xl"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-bold uppercase tracking-widest text-[10px]">Logout</span>}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/30 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Operational Status: <span className="text-emerald-500">Active</span></h2>
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
                  <span className="text-[10px] font-black uppercase tracking-widest">Version History</span>
                  <span className="text-[8px] font-bold text-indigo-400 uppercase">Latest: v2.5</span>
                </DropdownMenuLabel>
                <div className="max-h-[400px] overflow-y-auto">
                  {VERSION_HISTORY.map((v, i) => (
                    <div key={i} className="p-4 border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                          v.type === 'Update' ? "bg-emerald-500/20 text-emerald-400" :
                          v.type === 'Change' ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-500/20 text-slate-400"
                        )}>{v.type}</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">{v.date}</span>
                      </div>
                      <h4 className="text-xs font-black uppercase italic tracking-tight mb-1">{v.title} <span className="text-slate-600 ml-1">{v.version}</span></h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{v.notes}</p>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/profile">
              <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors">
                {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-500" />}
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