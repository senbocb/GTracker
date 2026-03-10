"use client";

import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { User, Shield, Target, Zap, Award, ChevronLeft, Camera } from 'lucide-react';
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
          <div className="h-48 w-full rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent" />
            <Button variant="ghost" size="sm" className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-950/50">
              <Camera size={14} className="mr-2" />
              Edit Banner
            </Button>
          </div>
          <div className="absolute -bottom-8 left-8 flex items-end gap-6">
            <div className="w-32 h-32 rounded-3xl bg-slate-950 border-4 border-[#020617] flex items-center justify-center shadow-2xl group cursor-pointer relative overflow-hidden">
              <User size={64} className="text-slate-800 group-hover:text-blue-500 transition-colors" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <div className="pb-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-700 italic">UNIDENTIFIED_USER</h1>
              <p className="text-slate-600 font-medium">New Recruit • Initialize Profile</p>
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
                  { label: 'Total Wins', value: '0', icon: Target, color: 'text-slate-600' },
                  { label: 'Win Rate', value: '0%', icon: Zap, color: 'text-slate-600' },
                  { label: 'Peak Rank', value: 'N/A', icon: Award, color: 'text-slate-600' },
                  { label: 'Hours Logged', value: '0h', icon: User, color: 'text-slate-600' },
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
              <div className="p-8 rounded-2xl bg-slate-900/30 border border-slate-800/50 text-center">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">No achievements unlocked</p>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Social Links</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-slate-800 hover:bg-slate-800 text-slate-500">
                  Connect Discord
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-800 hover:bg-slate-800 text-slate-500">
                  Connect Twitch
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