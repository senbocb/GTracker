"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Tag, Clock, CheckCircle2, Zap, Shield, Users, Terminal, Plus, Settings, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const VERSIONS = [
  {
    version: "v2.8.0",
    date: "2024-05-20",
    type: "Major",
    title: "Team Integration & Cloud Sync",
    description: "Complete overhaul of the team system with cloud synchronization and primary team selection.",
    changes: [
      { type: 'Feature', text: "Implemented Team Tags [TAG] visible across the interface." },
      { type: 'Feature', text: "Added Primary Team selection for global operator identification." },
      { type: 'Change', text: "Enhanced Team Settings with icon uploads and recruitment toggles." },
      { type: 'Fix', text: "Fixed cross-browser synchronization for real-time profile updates." }
    ]
  },
  {
    version: "v2.5.0",
    date: "2024-05-15",
    type: "Major",
    title: "Game Registry & Customization",
    description: "Introduced the Game Registry to allow users to define their own rank hierarchies and colors.",
    changes: [
      { type: 'Feature', text: "New Game Registry page for custom game definitions." },
      { type: 'Change', text: "Dynamic Rank Badge coloring based on registry hex codes." },
      { type: 'Feature', text: "Added support for CS2 Premier ELO (0-40,000) logging." },
      { type: 'Change', text: "Implemented conditional fields for Map/Scenario logging." }
    ]
  },
  {
    version: "v2.0.0",
    date: "2024-05-01",
    type: "Major",
    title: "Social Hub & Cloud Infrastructure",
    description: "Transitioned from local storage to Supabase cloud infrastructure.",
    changes: [
      { type: 'Feature', text: "Integrated Supabase Auth and Database." },
      { type: 'Feature', text: "Added Social Hub for finding and adding other operators." },
      { type: 'Feature', text: "Implemented Friend Requests and real-time status updates." },
      { type: 'Feature', text: "Added Profile Gallery for screenshot archiving." }
    ]
  }
];

const VersionHistory = () => {
  return (
    <AppLayout>
      <main className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Version History</h1>
          <p className="text-slate-400">A log of all features, changes, and fixes deployed to the platform.</p>
        </div>

        <div className="space-y-12">
          {VERSIONS.map((v) => (
            <div key={v.version} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-800" />
                <Badge variant="outline" className="bg-slate-900 border-slate-800 text-slate-400 font-mono px-3 py-1">
                  {v.version}
                </Badge>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{v.date}</span>
                    <Badge className={cn(
                      "text-[10px] font-bold uppercase",
                      v.type === 'Major' ? "bg-indigo-600" : "bg-slate-700"
                    )}>{v.type}</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-white">{v.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-slate-400">{v.description}</p>
                  
                  <div className="space-y-3">
                    {v.changes.map((change, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Badge variant="outline" className={cn(
                          "text-[8px] font-black uppercase px-1.5 py-0.5 shrink-0 mt-0.5",
                          change.type === 'Feature' ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/5" :
                          change.type === 'Change' ? "border-blue-500/50 text-blue-400 bg-blue-500/5" :
                          "border-red-500/50 text-red-400 bg-red-500/5"
                        )}>
                          {change.type}
                        </Badge>
                        <span className="text-sm text-slate-300">{change.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </AppLayout>
  );
};

export default VersionHistory;