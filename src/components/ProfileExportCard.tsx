"use client";

import React from 'react';
import { Shield, Trophy, Globe, Target, Zap, User } from 'lucide-react';
import RankBadge from './RankBadge';
import { cn } from '@/lib/utils';

interface ProfileExportCardProps {
  profile: any;
  socials: any[];
  selectedGames: any[];
  exportRef: React.RefObject<HTMLDivElement>;
}

const ProfileExportCard = ({ profile, socials, selectedGames, exportRef }: ProfileExportCardProps) => {
  return (
    <div className="fixed left-[-9999px] top-0">
      <div 
        ref={exportRef}
        className="w-[1200px] bg-[#020617] text-white overflow-hidden border border-slate-800 relative"
        style={{ minHeight: '675px' }}
      >
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/5 skew-x-12 translate-x-24" />
        
        {/* Banner */}
        <div className="h-64 w-full relative overflow-hidden">
          {profile.banner_url ? (
            <img src={profile.banner_url} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-violet-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          
          {/* Logo/Watermark */}
          <div className="absolute top-8 right-12 flex items-center gap-3 opacity-40">
            <Shield className="text-indigo-500" size={32} />
            <span className="text-2xl font-black italic uppercase tracking-tighter">Combat Archive</span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="px-16 -mt-24 relative z-10 grid grid-cols-12 gap-12 pb-16">
          {/* Left Column: Identity */}
          <div className="col-span-4 space-y-8">
            <div className="space-y-6">
              <div className="w-48 h-48 rounded-[2.5rem] bg-slate-800 border-[10px] border-[#020617] overflow-hidden shadow-2xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900"><User size={80} className="text-slate-700" /></div>
                )}
              </div>
              <div>
                <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">{profile.username}</h1>
                <div className="flex items-center gap-3 mt-4">
                  <div className="px-4 py-1.5 bg-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">Level {profile.level || 1}</div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">ID: {profile.id?.slice(0, 8)}</div>
                </div>
              </div>
            </div>

            {/* Socials Section */}
            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Links</p>
              <div className="grid grid-cols-1 gap-3">
                {socials.length > 0 ? socials.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <Globe size={16} className="text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest">{s.name}</span>
                  </div>
                )) : (
                  <p className="text-[10px] text-slate-600 italic">No public links archived.</p>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-600/5 border border-indigo-500/20">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Main Game</p>
                <p className="text-sm font-black uppercase italic">{profile.main_game || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-600/5 border border-indigo-500/20">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Region</p>
                <p className="text-sm font-black uppercase italic">{profile.region || 'Global'}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Ranks */}
          <div className="col-span-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                <Trophy className="text-yellow-500" size={24} />
                Combat Performance
              </h2>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Archive Data</div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {selectedGames.map((game) => (
                <div key={game.id} className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full -translate-y-12 translate-x-12" />
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-white mb-6 flex items-center gap-2">
                    <Target size={18} className="text-indigo-500" />
                    {game.title}
                  </h3>
                  
                  <div className="space-y-4">
                    {game.game_modes?.slice(0, 2).map((mode: any) => (
                      <div key={mode.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{mode.name}</p>
                          <RankBadge rank={mode.rank} tier={mode.tier} gameTitle={game.title} className="scale-90 origin-left" />
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Peak</p>
                          <p className="text-xs font-black uppercase italic text-white">{mode.peak_rank || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {selectedGames.length === 0 && (
                <div className="col-span-2 p-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20">
                  <p className="text-slate-500 font-black uppercase tracking-widest">No games selected for export</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-indigo-600" />
      </div>
    </div>
  );
};

export default ProfileExportCard;