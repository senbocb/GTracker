"use client";

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Gamepad2, Menu, LayoutDashboard, History, Settings, User, Bell, ChevronDown, Zap, Timer as TimerIcon, Library, Target, FileCode, Award, CheckSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import FloatingTimer from './FloatingTimer';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [isToolsOpen, setIsToolsOpen] = React.useState(true);
  const [customization, setCustomization] = useState({ bgColor: '#020617', bgImage: '' });

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('combat_profile') || 'null');
    setProfile(savedProfile);

    const savedCustom = JSON.parse(localStorage.getItem('combat_customization') || 'null');
    if (savedCustom) setCustomization(savedCustom);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'History', path: '/history', icon: <History size={18} /> },
    { label: 'Achievements', path: '/achievements', icon: <Award size={18} /> },
    { label: 'Registry', path: '/registry', icon: <Library size={18} /> },
  ];

  const tacticalTools = [
    { label: 'Habit Tracker', path: '/habits', icon: <CheckSquare size={16} /> },
    { label: 'Timer', path: '/timer', icon: <TimerIcon size={16} /> },
    { label: 'Crosshair Vault', path: '/crosshairs', icon: <Target size={16} /> },
    { label: 'Config Archive', path: '/configs', icon: <FileCode size={16} /> },
  ];

  const isCustomizablePage = location.pathname === '/' || location.pathname === '/profile';
  
  const bgStyle = isCustomizablePage ? {
    backgroundColor: customization.bgColor,
    backgroundImage: customization.bgImage ? `url(${customization.bgImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat'
  } : { backgroundColor: '#020617' };

  return (
    <div 
      className="min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-500 overflow-x-hidden"
      style={bgStyle}
    >
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover-highlight h-10 w-10">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-72 bg-slate-950 border-r border-slate-800 p-0 flex flex-col">
                <div className="relative h-40 shrink-0 overflow-hidden border-b border-slate-800">
                  {profile?.banner ? (
                    <img src={profile.banner} alt="" className="w-full h-full object-cover opacity-40" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-slate-950" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-indigo-500 shadow-lg">
                      <AvatarImage src={profile?.avatar} />
                      <AvatarFallback className="bg-slate-900 text-slate-300 font-black">
                        {profile?.username?.substring(0, 2).toUpperCase() || 'OP'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white uppercase italic tracking-tight truncate">{profile?.username || 'OPERATOR'}</p>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Level {Math.floor((profile?.xp || 0) / 100) + 1}</p>
                    </div>
                  </div>
                </div>
                
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 mb-2 mt-4">Operations</p>
                  {navItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start gap-3 h-11 font-bold uppercase italic tracking-tight text-xs",
                          location.pathname === item.path ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover-highlight"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 mb-2 mt-6">Tactical Tools</p>
                  <Collapsible open={isToolsOpen} onOpenChange={setIsToolsOpen} className="w-full">
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between gap-3 h-11 font-bold uppercase italic tracking-tight text-xs text-slate-400 hover:text-white hover-highlight"
                      >
                        <div className="flex items-center gap-3">
                          <Zap size={18} />
                          Tools
                        </div>
                        <ChevronDown className={cn("transition-transform", isToolsOpen && "rotate-180")} size={14} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-4 mt-1">
                      {tacticalTools.map((tool) => (
                        <Link key={tool.path} to={tool.path}>
                          <Button 
                            variant="ghost" 
                            className={cn(
                              "w-full justify-start gap-3 h-10 font-bold uppercase tracking-widest text-[9px]",
                              location.pathname === tool.path ? "text-indigo-400" : "text-slate-500 hover:text-white"
                            )}
                          >
                            {tool.icon}
                            {tool.label}
                          </Button>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </nav>

                <div className="p-3 border-t border-slate-900 space-y-1">
                  <Link to="/profile">
                    <Button variant="ghost" className="w-full justify-start gap-3 h-11 font-bold uppercase italic tracking-tight text-xs text-slate-400 hover:text-white hover-highlight">
                      <User size={18} />
                      Profile
                    </Button>
                  </Link>
                  <Link to="/settings">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-3 h-11 font-bold uppercase italic tracking-tight text-xs",
                        location.pathname === '/settings' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover-highlight"
                      )}
                    >
                      <Settings size={18} />
                      Settings
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Gamepad2 className="text-white" size={16} />
              </div>
              <span className="text-base font-black italic uppercase tracking-tighter text-white hidden sm:block">GTracker</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative hover-highlight h-9 w-9">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-slate-950" />
            </Button>

            <Link to="/profile">
              <Avatar className="w-8 h-8 border border-slate-800 hover:border-indigo-500 transition-colors">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback className="bg-slate-900 text-slate-400 text-[10px] font-black">
                  {profile?.username?.substring(0, 2).toUpperCase() || 'OP'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>

      <FloatingTimer />
    </div>
  );
};

export default AppLayout;