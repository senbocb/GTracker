"use client";

import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { User, Shield, Target, Zap, Award, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";

const Profile = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-4xl mx-auto p-6 md:p-10">
        <Link to="/">
          <Button variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4">
            <ChevronLeft className="mr-2" size={20} />
            Back to Dashboard
          </Button>
        </Link>

        <div className="relative mb-12">
          <div className="h-48 w-full rounded-3xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          </div>
          <div className="absolute -bottom-8 left-8 flex items-end gap-6">
            <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-[#020617] flex items-center justify-center shadow-2xl">
              <User size={64} className="text-blue-500" />
            </div>
            <div className="pb-2">
              <h1 className="text-3xl font-black tracking-tight text-white">COMMANDER_X</h1>
              <p className="text-slate-400 font-medium">Elite Operative • Joined Jan 2024</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="md:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="text-blue-500" size={20} />
                CAREER OVERVIEW
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Wins', value: '842', icon: Target, color: 'text-emerald-400' },
                  { label: 'Win Rate', value: '52.4%', icon: Zap, color: 'text-yellow-400' },
                  { label: 'Peak Rank', value: 'Global Elite', icon: Award, color: 'text-purple-400' },
                  { label: 'Hours Logged', value: '2,140h', icon: User, color: 'text-blue-400' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <stat.icon size={16} className={`${stat.color} mb-2`} />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">ACHIEVEMENTS</h2>
              <div className="space-y-3">
                {[
                  { name: 'Clutch Master', progress: 85, desc: 'Win 100 1vX situations' },
                  { name: 'Sharpshooter', progress: 42, desc: 'Maintain 25% headshot ratio' },
                  { name: 'Iron Wall', progress: 68, desc: 'Win 50 matches without losing a round' },
                ].map((ach, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-bold text-white">{ach.name}</p>
                        <p className="text-xs text-slate-500">{ach.desc}</p>
                      </div>
                      <p className="text-sm font-black text-blue-400">{ach.progress}%</p>
                    </div>
                    <Progress value={ach.progress} className="h-1.5 bg-slate-800" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Social Links</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-slate-800 hover:bg-slate-800">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-3" />
                  Discord Connected
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-800 hover:bg-slate-800">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-3" />
                  Twitch Linked
                </Button>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
};

export default Profile;