"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Gamepad2, Menu, LayoutDashboard, History, Settings, User, Bell, Search, ChevronDown, Zap, Timer } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const profile = JSON.parse(localStorage.getItem('combat_profile') || 'null');
  const [isToolsOpen, setIsToolsOpen] = React.useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'History', path: '/history', icon: <History size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover-highlight">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-1/4 bg-slate-950 border-r border-slate-800 p-0 flex flex-col">
                <div className="p-8 border-b border-slate-900">
                  <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <Gamepad2 className="text-white" size={20} />
                    </div>
                    <span className="text-lg font-black italic uppercase tracking-tighter text-white">GTracker.app</span>
                  </Link>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {navItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start gap-4 h-14 font-black uppercase italic tracking-tight text-sm",
                          location.pathname === item.path ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover-highlight"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  {/* Nested Tools Dropdown */}
                  <Collapsible open={isToolsOpen} onOpenChange={setIsToolsOpen} className="w-full">
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between gap-4 h-14 font-black uppercase italic tracking-tight text-sm text-slate-400 hover:text-white hover-highlight"
                      >
                        <div className="flex items-center gap-4">
                          <Zap size={20} />
                          Tactical Tools
                        </div>
                        <ChevronDown className={cn("transition-transform", isToolsOpen && "rotate-180")} size={16} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-4 mt-1">
                      <Link to="/timer">
                        <Button 
                          variant="ghost" 
                          className={cn(
                            "w-full justify-start gap-4 h-12 font-bold uppercase tracking-widest text-[10px]",
                            location.pathname === '/timer' ? "text-indigo-400" : "text-slate-500 hover:text-white"
                          )}
                        >
                          <Timer size={16} />
                          Combat Timer
                        </Button>
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                </nav>

                <div className="p-4 border-t border-slate-900">
                  <Link to="/settings">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-4 h-14 font-black uppercase italic tracking-tight text-sm",
                        location.pathname === '/settings' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover-highlight"
                      )}
                    >
                      <Settings size={20} />
                      Settings
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Gamepad2 className="text-white" size={20} />
              </div>
              <span className="text-lg font-black italic uppercase tracking-tighter text-white hidden sm:block">GTracker.app</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800">
              <Search size={14} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Search games..." 
                className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-300 placeholder:text-slate-600 w-32"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative hover-highlight">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950" />
            </Button>

            <Link to="/profile">
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800 group cursor-pointer hover-highlight rounded-r-xl py-2 pr-2">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none mb-1">{profile?.username || 'OPERATOR'}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest leading-none">Level {Math.floor((profile?.xp || 0) / 100) + 1}</p>
                </div>
                <Avatar className="w-10 h-10 border-2 border-slate-800 group-hover:border-indigo-500 transition-colors">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback className="bg-slate-900 text-slate-400 font-black">
                    {profile?.username?.substring(0, 2).toUpperCase() || 'OP'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Fixed Bottom-Left Settings Icon */}
      <div className="fixed bottom-8 left-8 z-50">
        <Link to="/settings">
          <Button size="icon" className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 shadow-2xl transition-all hover:scale-110">
            <Settings size={24} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AppLayout;