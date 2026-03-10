"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { User, Shield, Target, Zap, Award, ChevronLeft, Camera, Edit2, Check, X, Plus, ExternalLink, Settings2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { showSuccess } from '@/utils/toast';

interface CareerStat {
  id: string;
  label: string;
  gameId: string;
  statType: 'peak' | 'current' | 'winrate' | 'hours';
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: 'UNIDENTIFIED_USER',
    avatar: '',
    banner: ''
  });
  const [socials, setSocials] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [careerStats, setCareerStats] = useState<CareerStat[]>([]);
  
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
    showSuccess("Profile updated successfully.");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedProfile = { ...profile, [type]: base64String };
        setProfile(updatedProfile);
        localStorage.setItem('combat_profile', JSON.stringify(updatedProfile));
        showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} updated.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCareerStat = (gameId: string, statType: CareerStat['statType']) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const labels = { peak: 'Peak Rank', current: 'Current Rank', winrate: 'Win Rate', hours: 'Hours Logged' };
    const newStat: CareerStat = {
      id: Date.now().toString(),
      label: `${game.title} ${labels[statType]}`,
      gameId,
      statType
    };

    const updated = [...careerStats, newStat];
    setCareerStats(updated);
    localStorage.setItem('combat_career_stats', JSON.stringify(updated));
    showSuccess("Stat added to overview.");
  };

  const removeStat = (id: string) => {
    const updated = careerStats.filter(s => s.id !== id);
    setCareerStats(updated);
    localStorage.setItem('combat_career_stats', JSON.stringify(updated));
  };

  const getStatValue = (stat: CareerStat) => {
    const game = games.find(g => g.id === stat.gameId);
    if (!game) return 'N/A';
    if (stat.statType === 'peak') return game.peakRank || 'N/A';
    if (stat.statType === 'current') return game.rank || 'N/A';
    if (stat.statType === 'winrate') return game.winRate || '0%';
    if (stat.statType === 'hours') return game.hoursPlayed || '0h';
    return 'N/A';
  };

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
            {profile.banner ? (
              <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent" />
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-950/50"
              onClick={() => bannerInputRef.current?.click()}
            >
              <Camera size={14} className="mr-2" />
              Edit Banner
            </Button>
            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
          </div>
          <div className="absolute -bottom-8 left-8 flex items-end gap-6">
            <div 
              className="w-32 h-32 rounded-3xl bg-slate-950 border-4 border-[#020617] flex items-center justify-center shadow-2xl group cursor-pointer relative overflow-hidden"
              onClick={() => avatarInputRef.current?.click()}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-slate-800 group-hover:text-blue-500 transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
            </div>
            <div className="pb-2 flex-1">
              {isEditing ? (
                <Input 
                  value={profile.username} 
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                  className="bg-slate-900 border-slate-800 text-white font-black italic"
                />
              ) : (
                <h1 className="text-3xl font-black tracking-tight text-white italic uppercase">{profile.username}</h1>
              )}
            </div>
            <div className="pb-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500">
                    <Check size={16} className="mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="text-slate-400">
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="border-slate-800 text-slate-400 hover:text-white">
                  <Edit2 size={14} className="mr-2" /> Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="md:col-span-2 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="text-blue-500" size={20} />
                  CAREER OVERVIEW
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white">
                      <Settings2 size={16} className="mr-2" /> Configure
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-950 border-slate-800 text-white">
                    <DialogHeader>
                      <DialogTitle>CONFIGURE OVERVIEW</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label>Add New Stat</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Select onValueChange={(v) => {
                            const [gId, type] = v.split(':');
                            addCareerStat(gId, type as any);
                          }}>
                            <SelectTrigger className="bg-slate-900 border-slate-800">
                              <SelectValue placeholder="Select Game & Stat" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                              {games.map(g => (
                                <React.Fragment key={g.id}>
                                  <SelectItem value={`${g.id}:peak`}>{g.title} - Peak Rank</SelectItem>
                                  <SelectItem value={`${g.id}:current`}>{g.title} - Current Rank</SelectItem>
                                  <SelectItem value={`${g.id}:winrate`}>{g.title} - Win Rate</SelectItem>
                                  <SelectItem value={`${g.id}:hours`}>{g.title} - Playtime</SelectItem>
                                </React.Fragment>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Active Stats</Label>
                        <div className="space-y-2">
                          {careerStats.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                              <span className="text-sm">{s.label}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeStat(s.id)}>
                                <X size={14} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {careerStats.map((stat) => (
                  <div key={stat.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 group relative">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black text-white">{getStatValue(stat)}</p>
                  </div>
                ))}
                {careerStats.length === 0 && (
                  <div className="col-span-2 p-8 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">No stats configured</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Social Links</h3>
                <Link to="/add-social">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500 hover:text-blue-400">
                    <Plus size={16} />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {socials.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-colors group"
                  >
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white">{link.name}</span>
                    <ExternalLink size={14} className="text-slate-600 group-hover:text-blue-500" />
                  </a>
                ))}
                {socials.length === 0 && (
                  <p className="text-xs text-slate-600 italic">No links added yet.</p>
                )}
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