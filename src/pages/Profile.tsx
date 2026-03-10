"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { User, Shield, Target, Zap, Award, ChevronLeft, Camera, Edit2, Check, X, Plus, ExternalLink, Settings2, Globe, Medal, Star, Trophy, Gamepad2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { showSuccess } from '@/utils/toast';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: 'UNIDENTIFIED_USER',
    avatar: '',
    banner: '',
    createdAt: '',
    xp: 0
  });
  const [socials, setSocials] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [careerStats, setCareerStats] = useState<any[]>([]);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('combat_profile') || 'null');
    if (savedProfile) setProfile(savedProfile);
    const savedSocials = JSON.parse(localStorage.getItem('combat_socials') || '[]');
    setSocials(savedSocials);
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    setGames(savedGames);
    const savedStats = JSON.parse(localStorage.getItem('combat_career_stats') || '[]');
    setCareerStats(savedStats);
  }, []);

  const handleSave = () => {
    localStorage.setItem('combat_profile', JSON.stringify(profile));
    setIsEditing(false);
    showSuccess("Profile updated.");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...profile, [type]: reader.result as string };
        setProfile(updated);
        localStorage.setItem('combat_profile', JSON.stringify(updated));
        showSuccess(`${type} updated.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const level = Math.floor(profile.xp / 100) + 1;
  const medals = [
    { id: 'recruit', label: 'Recruit', icon: <User size={20} />, minLevel: 1, color: 'text-slate-400' },
    { id: 'veteran', label: 'Veteran', icon: <Shield size={20} />, minLevel: 5, color: 'text-blue-400' },
    { id: 'elite', label: 'Elite', icon: <Star size={20} />, minLevel: 10, color: 'text-indigo-400' },
    { id: 'legend', label: 'Legend', icon: <Trophy size={20} />, minLevel: 20, color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-4xl mx-auto p-6 md:p-10">
        <Link to="/"><Button variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4 hover-highlight"><ChevronLeft className="mr-2" size={20} /> Back to Dashboard</Button></Link>

        <div className="relative mb-12">
          <div className="h-48 w-full rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden relative">
            {profile.banner ? <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent" />}
            <Button variant="ghost" size="sm" className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-950/50" onClick={() => bannerInputRef.current?.click()}><Camera size={14} className="mr-2" /> Edit Banner</Button>
            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
          </div>
          
          <div className="absolute -bottom-10 left-8 flex items-end gap-6 w-[calc(100%-4rem)]">
            <div className="w-32 h-32 rounded-3xl bg-slate-950 border-4 border-[#020617] flex items-center justify-center shadow-2xl group cursor-pointer relative overflow-hidden shrink-0" onClick={() => avatarInputRef.current?.click()}>
              {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={64} className="text-slate-800 group-hover:text-indigo-500 transition-colors" />}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera size={24} className="text-white" /></div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
            </div>
            
            <div className="pb-4 flex-1 min-w-0">
              {isEditing ? <Input value={profile.username} onChange={(e) => setProfile({...profile, username: e.target.value})} className="bg-slate-900 border-slate-800 text-white font-black italic h-10" /> : (
                <div className="space-y-1">
                  <h1 className="text-3xl font-black tracking-tight text-white italic uppercase truncate">{profile.username}</h1>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Level {level} Operator</p>
                </div>
              )}
            </div>
            <div className="pb-4 shrink-0">
              {isEditing ? <Button size="sm" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500"><Check size={16} className="mr-1" /> Save</Button> : <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="border-slate-800 text-slate-400 hover:text-white hover-highlight"><Edit2 size={14} className="mr-2" /> Edit Profile</Button>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="md:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="text-indigo-500" size={20} /> CAREER OVERVIEW</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {careerStats.length > 0 ? careerStats.map((stat) => (
                  <div key={stat.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 group relative hover:border-indigo-500/30 transition-colors">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-white">---</p>
                  </div>
                )) : <div className="col-span-full p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-600 text-xs font-bold uppercase">No stats pinned to overview.</div>}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Medal className="text-yellow-500" size={20} /> MEDALS & ACHIEVEMENTS</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {medals.map((medal) => (
                  <div key={medal.id} className={cn("p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all", level >= medal.minLevel ? "bg-slate-900/50 border-slate-800" : "bg-slate-950/20 border-slate-900 opacity-30 grayscale")}>
                    <div className={cn("w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center shadow-lg", level >= medal.minLevel ? medal.color : "text-slate-800")}>{medal.icon}</div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter text-white">{medal.label}</p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{level >= medal.minLevel ? 'Unlocked' : `Level ${medal.minLevel}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase">Total XP</span><span className="text-sm font-black text-indigo-500">{profile.xp}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase">Games Tracked</span><span className="text-sm font-black text-white">{games.length}</span></div>
              </div>
            </section>
          </div>
        </div>
        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10"><MadeWithDyad /></footer>
      </main>
    </div>
  );
};

export default Profile;