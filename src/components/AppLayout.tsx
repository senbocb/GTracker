"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Target, FileCode, User, Settings, Bell, LogOut, LogIn, Zap, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";

const VERSION_HISTORY = [
  { version: "v2.4", type: "Update", title: "Auth & PIN Security", date: "Today", notes: "Implemented Supabase auth with mandatory PIN security and cross-device sync." },
  { version: "v2.3", type: "Change", title: "CS2 Per-Map Overhaul", date: "Yesterday", notes: "Redesigned map tracking with 14 maps and rank-first logging flow." },
  { version: "v2.2", type: "Note", title: "Season Management", date: "2 days ago", notes: "Added season tags to history and multi-season peak tracking." },
  { version: "v2.1", type: "Update", title: "Visual Refinements", date: "3 days ago", notes: "Optimized heatmap density and fixed high-contrast UI elements." }
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <History size={20} />, label: 'History', path: '/history' },
    { icon: <Zap size={20} />, label: 'Habits', path: '/habits' },
    { icon: <Target size={20} />, label: 'Crosshairs', path: '/crosshairs' },
    { icon: <FileCode size={20} />, label: 'Configs', path: '/configs' },
    { icon: <User size={20} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex">
      <aside className="w-20 md:w-64 border-r border-slate-800 flex flex-col bg-slate-950/50 backdrop-blur-xl sticky top-0 h-screen z-50">
        <div className="p-6 mb-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <Target className="text-white" size={24} />
            </div>
            <span className="hidden md:block text-xl font-black italic tracking-tighter text-white uppercase">GTracker</span>
          </Link>
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
                <span className="hidden md:block font-bold uppercase tracking-widest text-[10px]">{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link to="/settings">
            <Button variant="ghost" className="w-full justify-start gap-4 h-12 text-slate-400 hover:text-white rounded-xl">
              <Settings size={20} />
              <span className="hidden md:block font-bold uppercase tracking-widest text-[10px]">Settings</span>
            </Button>
          </Link>
          {user ? (
            <Button 
              variant="ghost" 
              onClick={() => supabase.auth.signOut()}
              className="w-full justify-start gap-4 h-12 text-slate-400 hover:text-red-400 rounded-xl"
            >
              <LogOut size={20} />
              <span className="hidden md:block font-bold uppercase tracking-widest text-[10px]">Logout</span>
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="ghost" className="w-full justify-start gap-4 h-12 text-indigo-400 hover:text-white hover:bg-indigo-600/20 rounded-xl">
                <LogIn size={20} />
                <span className="hidden md:block font-bold uppercase tracking-widest text-[10px]">Login</span>
              </Button>
            </Link>
          )}
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
                  <span className="text-[8px] font-bold text-indigo-400 uppercase">Latest: v2.4</span>
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
            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
              {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-500" />}
            </div>
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