"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Tag, Clock, CheckCircle2, Zap, Shield, Users, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

const VERSIONS = [
  {
    version: "v2.8.0",
    date: "2024-05-20",
    type: "Major",
    title: "Tactical Team Integration",
    description: "Complete overhaul of the team system with cloud synchronization and primary team selection.",
    changes: [
      "Implemented Team Tags [TAG] visible across the interface.",
      "Added Primary Team selection for global operator identification.",
      "Enhanced Team Settings with icon uploads and recruitment toggles.",
      "Fixed cross-browser synchronization for real-time profile updates."
    ],
    icon: <Shield className="text-indigo-500" />
  },
  {
    version: "v2.5.0",
    date: "2024-05-15",
    type: "Major",
    title: "Game Registry & Customization",
    description: "Introduced the Game Registry to allow users to define their own rank hierarchies and colors.",
    changes: [
      "New Game Registry page for custom game definitions.",
      "Dynamic Rank Badge coloring based on registry hex codes.",
      "Added support for CS2 Premier ELO (0-40,000) logging.",
      "Implemented conditional fields for Map/Scenario logging."
    ],
    icon: <Terminal className="text-emerald-500" />
  },
  {
    version: "v2.0.0",
    date: "2024-05-01",
    type: "Major",
    title: "Social Hub & Cloud Sync",
    description: "Transitioned from local storage to Supabase cloud infrastructure.",
    changes: [
      "Integrated Supabase Auth and Database.",
      "Added Social Hub for finding and adding other operators.",
      "Implemented Friend Requests and real-time status updates.",
      "Added Profile Gallery for screenshot archiving."
    ],
    icon: <Users className="text-blue-500" />
  },
  {
    version: "v1.2.0",
    date: "2024-04-20",
    type: "Minor",
    title: "Tactical UI Enhancements",
    description: "Refined the visual identity with new theme presets and animations.",
    changes: [
      "Added 'Cyber Neon' and 'Stealth Ops' theme presets.",
      "Implemented tactical scanline and CRT overlay effects.",
      "Added Framer Motion for smoother interface transitions.",
      "Optimized mobile navigation and layout responsiveness."
    ],
    icon: <Zap className="text-yellow-500" />
  },
  {
    version: "v1.0.0",
    date: "2024-04-10",
    type: "Major",
    title: "Core Deployment",
    description: "Initial release of the GTracker core tracking engine.",
    changes: [
      "Dashboard with Game Cards and List views.",
      "Basic rank logging for Valorant, CS2, and League.",
      "Session Tracker for monitoring daily progress.",
      "Match History archive with CSV export."
    ],
    icon: <CheckCircle2 className="text-indigo-500" />
  },
  {
    version: "v0.0.0",
    date: "2024-04-01",
    type: "Minor",
    title: "Initial Prototype",
    description: "System initialization and architecture design.",
    changes: [
      "Project structure initialized.",
      "Base UI components developed.",
      "Local storage persistence layer implemented."
    ],
    icon: <Clock className="text-slate-500" />
  }
];

const VersionHistory = () => {
  return (
    <AppLayout>
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase flex items-center gap-4">
            <GitBranch className="text-indigo-500" size={36} />
            Version Archive
          </h1>
          <p className="text-slate-400 font-medium">Chronological record of system updates and tactical deployments.</p>
        </div>

        <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {VERSIONS.map((v, idx) => (
            <div key={v.version} className="relative pl-12 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="absolute left-0 top-1 w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center z-10 shadow-xl">
                {v.icon}
              </div>
              
              <Card className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/30 transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5",
                        v.type === 'Major' ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/30" : "bg-slate-800 text-slate-400 border-slate-700"
                      )}>
                        {v.type} Update
                      </Badge>
                      <span className="text-xs font-mono text-slate-500">{v.version}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12} /> {new Date(v.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white mt-2 group-hover:text-indigo-400 transition-colors">
                    {v.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-400 leading-relaxed">{v.description}</p>
                  <div className="space-y-2 pt-2 border-t border-slate-800/50">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Changelog</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {v.changes.map((change, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <footer className="mt-20 py-10 border-t border-slate-800 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">End of Archive • System Stable</p>
        </footer>
      </main>
    </AppLayout>
  );
};

export default VersionHistory;