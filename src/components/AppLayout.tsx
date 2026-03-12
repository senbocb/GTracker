"use client";

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Gamepad2, Menu, LayoutDashboard, History, Settings, User, Bell, Search, ChevronDown, Zap, Timer as TimerIcon, Library, Target, FileCode, Award } from 'lucide-react';
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
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'History', path: '/history', icon: <History size={20} /> },
    { label: 'Achievements', path: '/achievements', icon: <Award size={20} /> },
    { label: 'Registry', path: '/registry', icon: <Library size={20} /> },
  ];

  const tacticalTools = [
    { label: 'Timer', path: '/timer', icon: <TimerIcon size={18} /> },
    { label: 'Crosshair Vault', path: '/crosshairs', icon: <Target size={18} /> },
    { label: 'Config Archive', path: '/configs', icon: <FileCode size={18} /> },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover-highlight">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-80 bg-slate-950 border-r border-slate-800 p-0 flex flex-col">
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
                          location.pathname === item.path ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white hover-highlight"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  <Collapsible open={isToolsOpen} onOpenChange={setIsToolsOpen} className="w-full">
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between gap-4 h-14 font-black uppercase italic tracking-tight text-sm text-slate-300 hover:text-white hover-highlight"
                      >
                        <div className="flex items-center gap-4">
                          <Zap size={20} />
                          Tactical Tools
                        </div>
                        <ChevronDown className={cn("transition-transform", isToolsOpen && "rotate-180")} size={16} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-4 mt-1">
                      {tacticalTools.map((tool) => (
                        <Link key={tool.path} to={tool.path}>
                          <Button 
                            variant="ghost" 
                            className={cn(
                              "w-full justify-start gap-4 h-12 font-bold uppercase tracking-widest text-[10px]",
                              location.pathname === tool.path ? "text-indigo-400" : "text-slate-400 hover:text-white"
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

                <div className="p-4 border-t border-slate-900">
                  <Link to="/settings">
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-4 h-14 font-black uppercase italic tracking-tight text-sm",
                        location.pathname === '/settings' ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white hover-highlight"
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

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800">
              <Search size={14} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search games..." 
                className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-200 placeholder:text-slate-500 w-32"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white relative hover-highlight">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950" />
            </Button>

            <Link to="/profile">
              <div className="relative flex items-center gap-3 pl-4 border-l border-slate-800 group cursor-pointer hover-highlight rounded-r-xl py-2 pr-2 overflow-hidden">
                {profile?.banner && (
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                    <img src={profile.banner} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-transparent to-slate-950" />
                  </div>
                )}
                
                <div className="text-right hidden sm:block relative z-10">
                  <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none mb-1">{profile?.username || 'OPERATOR'}</p>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Level {Math.floor((profile?.xp || 0) / 100) + 1}</p>
                </div>
                <Avatar className="w-10 h-10 border-2 border-slate-800 group-hover:border-indigo-500 transition-colors relative z-10">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback className="bg-slate-900 text-slate-300 font-black">
                    {profile?.username?.substring(0, 2).toUpperCase() || 'OP'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col min-h-[calc(100vh-5rem)]">
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>

      {/* Persistent Floating Timer */}
      <FloatingTimer />

      <div className="fixed bottom-8 left-8 z-50">
        <Link to="/settings">
          <Button size="icon" className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover-border-indigo-500 shadow-2xl transition-all hover:scale-110">
            <Settings size={24} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AppLayout;