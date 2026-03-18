"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, History, Zap, Users, Shield, Target, FileCode, 
  User, Settings, LogOut, Bell, Search, Terminal, Loader2, Menu, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { motion } from "framer-motion";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AddMatchModal from "./AddMatchModal";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    onLogMatch: () => setIsLogOpen(true),
    onToggleTimer: () => navigate('/timer'),
    onFocusSearch: () => searchRef.current?.focus()
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/' },
        { icon: <History size={18} />, label: 'History', path: '/history' },
        { icon: <Zap size={18} />, label: 'Habits', path: '/habits' },
      ]
    },
    {
      label: 'Community',
      items: [
        { icon: <Users size={18} />, label: 'Social', path: '/social' },
        { icon: <Shield size={18} />, label: 'Teams', path: '/teams' },
      ]
    },
    {
      label: 'Resources',
      items: [
        { icon: <Target size={18} />, label: 'Crosshairs', path: '/crosshairs' },
        { icon: <FileCode size={18} />, label: 'Configs', path: '/configs' },
      ]
    }
  ];

  const NavContent = ({ collapsed = false, onItemClick = () => {} }) => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" onClick={onItemClick}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Terminal className="text-white" size={18} />
          </div>
          {!collapsed && <span className="text-lg font-bold tracking-tight text-white">GTracker</span>}
        </Link>
      </div>

      <div className="flex-1 px-3 space-y-6 overflow-y-auto py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <Link key={item.path} to={item.path} onClick={onItemClick}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start gap-3 h-10 rounded-lg transition-all duration-200",
                    location.pathname === item.path 
                      ? "bg-indigo-600/10 text-indigo-400" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                  )}
                >
                  <span className={cn(location.pathname === item.path ? "text-indigo-400" : "text-slate-500")}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Button>
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800/50 space-y-1">
        <Link to="/settings" onClick={onItemClick}>
          <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-slate-400 hover:text-white rounded-lg">
            <Settings size={18} />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          onClick={() => { signOut(); onItemClick(); }}
          className="w-full justify-start gap-3 h-10 text-slate-400 hover:text-red-400 rounded-lg"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </Button>
      </div>
    </div>
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex border-r border-slate-800/50 flex-col bg-slate-950/40 backdrop-blur-xl sticky top-0 h-screen z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <NavContent collapsed={isCollapsed} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-6 bg-slate-950/20 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-400">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-slate-950 border-slate-800 p-0 w-64">
                <NavContent />
              </SheetContent>
            </Sheet>

            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <Input 
                ref={searchRef}
                placeholder="Search anything... (/)" 
                className="bg-slate-900/50 border-slate-800/50 pl-10 h-9 text-sm focus:ring-indigo-500 rounded-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full relative">
              <Bell size={20} />
              {/* Notification dot removed until real notifications are implemented */}
            </Button>
            <Link to="/profile">
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-all">
                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User size={16} className="text-slate-500" />}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="p-6 md:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <AddMatchModal 
        isOpen={isLogOpen} 
        onClose={() => setIsLogOpen(false)} 
        onSuccess={() => {}} 
      />
    </div>
  );
};

export default AppLayout;