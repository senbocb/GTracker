"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { User, Shield, Target, Zap, Award, ChevronLeft, Camera, Edit2, Check, X, Plus, ExternalLink, Settings2, Globe, Medal, Star, Trophy, Gamepad2, Link as LinkIcon, Trash2, BarChart3, Share2, UserCircle, Calendar, Search, Filter, Layout } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from "@/lib/utils";
import AppLayout from '@/components/AppLayout';
import { processImage } from '@/utils/imageProcessing';
import LayoutSettings, { LayoutSection } from '@/components/LayoutSettings';

// DnD Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableCategory from '@/components/SortableCategory';

const COUNTRIES = [
  { name: "United States", flag: "🇺🇸" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "France", flag: "🇫🇷" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "India", flag: "🇮🇳" },
  { name: "China", flag: "🇨🇳" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Sweden", flag: "🇸🇪" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Denmark", flag: "🇩🇰" },
  { name: "Finland", flag: "🇫🇮" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Turkey", flag: "🇹🇷" },
];

const INITIAL_CATEGORIES = [
  { id: 'stat_trackers', label: 'Stats', icon: <BarChart3 size={12} /> },
  { id: 'socials', label: 'Socials', icon: <Share2 size={12} /> },
  { id: 'game_profiles', label: 'Profiles', icon: <UserCircle size={12} /> },
];

const DEFAULT_PROFILE_LAYOUT: LayoutSection[] = [
  { id: 'career_overview', label: 'Career Overview', enabled: true },
  { id: 'medals', label: 'Medals & Achievements', enabled: true },
  { id: 'profile_stats', label: 'Profile Stats', enabled: true },
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [profile, setProfile] = useState({
    username: 'UNIDENTIFIED_USER',
    avatar: '',
    banner: '',
    createdAt: new Date().toISOString(),
    xp: 0,
    country: 'United States',
    countryFlag: '🇺🇸'
  });
  const [socials, setSocials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(INITIAL_CATEGORIES);
  const [games, setGames] = useState<any[]>([]);
  const [careerStats, setCareerStats] = useState<any[]>([]);
  const [profileLayout, setProfileLayout] = useState<LayoutSection[]>(DEFAULT_PROFILE_LAYOUT);
  
  const [achievementSearch, setAchievementSearch] = useState('');
  const [achievementSort, setAchievementSort] = useState('newest');
  
  const [newSocial, setNewSocial] = useState({ name: '', url: '', icon: '', category: 'socials' });
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const socialIconRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('combat_profile') || 'null');
    if (savedProfile) {
      setProfile(prev => ({
        ...prev,
        ...savedProfile,
        createdAt: savedProfile.createdAt || prev.createdAt
      }));
    }

    const savedSocials = JSON.parse(localStorage.getItem('combat_socials') || '[]');
    setSocials(savedSocials);
    
    const savedCategories = JSON.parse(localStorage.getItem('combat_categories') || 'null');
    if (savedCategories) {
      const withIcons = savedCategories.map((sc: any) => ({
        ...sc,
        icon: INITIAL_CATEGORIES.find(ic => ic.id === sc.id)?.icon
      }));
      setCategories(withIcons);
    }

    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    setGames(savedGames);
    
    const savedLayout = JSON.parse(localStorage.getItem('combat_profile_layout') || 'null');
    if (savedLayout) setProfileLayout(savedLayout);
  }, []);

  const handleSave = () => {
    localStorage.setItem('combat_profile', JSON.stringify(profile));
    setIsEditing(false);
    showSuccess("Profile updated.");
  };

  const updateProfileLayout = (newLayout: LayoutSection[]) => {
    setProfileLayout(newLayout);
    localStorage.setItem('combat_profile_layout', JSON.stringify(newLayout));
  };

  const handleCountryChange = (countryName: string) => {
    const country = COUNTRIES.find(c => c.name === countryName);
    if (country) {
      setProfile({ ...profile, country: country.name, countryFlag: country.flag });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner' | 'social') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        let maxWidth = 400;
        let maxHeight = 400;
        if (type === 'banner') { maxWidth = 1200; maxHeight = 600; }
        else if (type === 'social') { maxWidth = 100; maxHeight = 100; }
        
        const processed = await processImage(file, maxWidth, maxHeight, 0.7);
        
        if (type === 'social') {
          setNewSocial({ ...newSocial, icon: processed });
        } else {
          const updated = { ...profile, [type]: processed };
          setProfile(updated);
          localStorage.setItem('combat_profile', JSON.stringify(updated));
          showSuccess(`${type} updated.`);
        }
      } catch (err) {
        showError(`Failed to process ${type}.`);
      }
    }
  };

  const handleAddSocial = () => {
    if (!newSocial.name || !newSocial.url) {
      showError("Name and URL are required.");
      return;
    }
    const updatedSocials = [...socials, { ...newSocial, id: Date.now().toString() }];
    setSocials(updatedSocials);
    localStorage.setItem('combat_socials', JSON.stringify(updatedSocials));
    setNewSocial({ name: '', url: '', icon: '', category: 'socials' });
    setIsAddingSocial(false);
    showSuccess("Platform linked.");
  };

  const removeSocial = (id: string) => {
    const updated = socials.filter(s => s.id !== id);
    setSocials(updated);
    localStorage.setItem('combat_socials', JSON.stringify(updated));
    showSuccess("Platform removed.");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const isActiveCategory = categories.some(c => c.id === active.id);
      if (isActiveCategory) {
        setCategories((items) => {
          const oldIndex = items.findIndex(i => i.id === active.id);
          const newIndex = items.findIndex(i => i.id === over.id);
          const newItems = arrayMove(items, oldIndex, newIndex);
          localStorage.setItem('combat_categories', JSON.stringify(newItems.map(({id, label}) => ({id, label}))));
          return newItems;
        });
      } else {
        setSocials((items) => {
          const oldIndex = items.findIndex(i => i.id === active.id);
          const newIndex = items.findIndex(i => i.id === over.id);
          const newItems = arrayMove(items, oldIndex, newIndex);
          localStorage.setItem('combat_socials', JSON.stringify(newItems));
          return newItems;
        });
      }
    }
  };

  const level = Math.floor(profile.xp / 100) + 1;
  const creationDate = new Date(profile.createdAt);
  const formattedCreationDate = creationDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  const peakAchievements = useMemo(() => {
    return games.flatMap(game => 
      game.modes.filter((m: any) => {
        const r = m.peakRank?.toLowerCase() || "";
        return r === 'radiant' || r === 'top 500' || r === 'challenger' || r === 'apex predator';
      }).map((m: any) => ({
        id: `master_${game.id}_${m.name}`,
        label: `${game.title} Master`,
        icon: <Trophy size={20} />,
        unlocked: true,
        color: 'text-indigo-400 rainbow-gradient',
        date: 'Peak Achieved'
      }))
    );
  }, [games]);

  const medals = useMemo(() => {
    const base = [
      { id: 'recruit', label: 'Recruit', icon: <User size={20} />, minLevel: 1, color: 'text-slate-300' },
      { id: 'veteran', label: 'Veteran', icon: <Shield size={20} />, minLevel: 5, color: 'text-blue-400' },
      { id: 'elite', label: 'Elite', icon: <Star size={20} />, minLevel: 10, color: 'text-indigo-400' },
      { id: 'legend', label: 'Legend', icon: <Trophy size={20} />, minLevel: 20, color: 'text-yellow-400' },
      ...peakAchievements
    ];

    return base
      .filter(m => m.label.toLowerCase().includes(achievementSearch.toLowerCase()))
      .sort((a, b) => {
        if (achievementSort === 'newest') return -1;
        if (achievementSort === 'oldest') return 1;
        return 0;
      });
  }, [peakAchievements, level, achievementSearch, achievementSort]);

  const groupedSocials = useMemo(() => {
    const groups: Record<string, any[]> = { stat_trackers: [], socials: [], game_profiles: [] };
    socials.forEach(s => {
      const cat = s.category || 'socials';
      if (groups[cat]) groups[cat].push(s);
    });
    return groups;
  }, [socials]);

  const renderSection = (id: string) => {
    const section = profileLayout.find(s => s.id === id);
    if (!section || !section.enabled) return null;

    switch (id) {
      case 'career_overview':
        return (
          <section key="career_overview" className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="text-indigo-500" size={20} /> CAREER OVERVIEW</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {careerStats.length > 0 ? careerStats.map((stat) => (
                <div key={stat.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 group relative hover:border-indigo-500/30 transition-colors backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-white">---</p>
                </div>
              )) : <div className="col-span-full p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs font-bold uppercase bg-slate-900/40 backdrop-blur-sm">No stats pinned to overview.</div>}
            </div>
          </section>
        );
      case 'medals':
        return (
          <section key="medals" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Medal className="text-yellow-500" size={20} /> MEDALS & ACHIEVEMENTS</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <Input 
                    placeholder="Search..." 
                    value={achievementSearch}
                    onChange={(e) => setAchievementSearch(e.target.value)}
                    className="bg-slate-900 border-slate-800 h-8 pl-8 text-[10px] w-32"
                  />
                </div>
                <Select value={achievementSort} onValueChange={setAchievementSort}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 h-8 text-[10px] w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {medals.map((medal: any) => {
                const isUnlocked = medal.unlocked || level >= medal.minLevel;
                return (
                  <div key={medal.id} className={cn("p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all backdrop-blur-sm", isUnlocked ? "bg-slate-900/90 border-slate-800" : "bg-slate-950/40 border-slate-900 opacity-30 grayscale")}>
                    <div className={cn("w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center shadow-lg", isUnlocked ? medal.color : "text-slate-700")}>{medal.icon}</div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter text-white">{medal.label}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {isUnlocked ? (medal.date || 'Unlocked') : `Level ${medal.minLevel}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      case 'profile_stats':
        return (
          <section key="profile_stats" className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Profile Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase">Joined</span>
                <span className="text-sm font-black text-white">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase">Country</span>
                <span className="text-sm font-black text-white flex items-center gap-2">
                  <span>{profile.countryFlag}</span>
                  <span>{profile.country}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase">Total XP</span>
                <span className="text-sm font-black text-indigo-400">{profile.xp}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase">Games Tracked</span>
                <span className="text-sm font-black text-white">{games.length}</span>
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <main className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="relative mb-12">
          <div className="h-48 w-full rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden relative backdrop-blur-sm">
            {profile.banner ? <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent" />}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-slate-300 hover:text-white bg-slate-950/50 rounded-full h-10 w-10" 
              onClick={() => bannerInputRef.current?.click()}
            >
              <Camera size={18} />
            </Button>
            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
          </div>
          
          <div className="absolute -bottom-10 left-8 flex items-end gap-6 w-[calc(100%-4rem)]">
            <div className="w-32 h-32 rounded-3xl bg-slate-950 border-4 border-[#020617] flex items-center justify-center shadow-2xl group cursor-pointer relative overflow-hidden shrink-0" onClick={() => avatarInputRef.current?.click()}>
              {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={64} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera size={24} className="text-white" /></div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
            </div>
            
            <div className="pb-4 flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3 max-w-xs animate-in fade-in slide-in-from-left-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Username</Label>
                    <Input 
                      value={profile.username} 
                      onChange={(e) => setProfile({...profile, username: e.target.value})} 
                      className="bg-slate-900 border-slate-800 text-white font-black italic h-10" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Country</Label>
                    <Select onValueChange={handleCountryChange} value={profile.country}>
                      <SelectTrigger className="bg-slate-900 border-slate-800 text-white h-10">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {COUNTRIES.map(c => (
                          <SelectItem key={c.name} value={c.name} className="focus:bg-indigo-600">
                            <span className="mr-2">{c.flag}</span> {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 font-bold">
                      <Check size={16} className="mr-1" /> Save Changes
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div onClick={() => setIsEditing(true)} className="cursor-pointer group inline-block">
                    <h1 className="text-3xl font-black tracking-tight text-white italic uppercase truncate group-hover:text-indigo-400 transition-colors flex items-center gap-3">
                      {profile.username}
                      <Edit2 size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                    </h1>
                  </div>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Level {level} Operator</p>
                  
                  <div className="flex flex-wrap items-start gap-6 max-w-full overflow-hidden">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={categories.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                        {categories.map(cat => {
                          const items = groupedSocials[cat.id];
                          if (items.length === 0 && cat.id !== 'socials') return null;
                          return (
                            <SortableCategory 
                              key={cat.id}
                              category={cat}
                              items={items}
                              onRemoveSocial={removeSocial}
                              onAddClick={() => setIsAddingSocial(true)}
                              showAddButton={cat.id === 'socials'}
                            />
                          );
                        })}
                      </SortableContext>
                    </DndContext>

                    <Dialog open={isAddingSocial} onOpenChange={setIsAddingSocial}>
                      <DialogContent className="bg-slate-950 border-slate-800 text-white">
                        <DialogHeader><DialogTitle className="italic uppercase font-black">LINK PLATFORM</DialogTitle></DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="grid gap-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Category</Label>
                            <Select onValueChange={(v) => setNewSocial({...newSocial, category: v})} value={newSocial.category}>
                              <SelectTrigger className="bg-slate-900 border-slate-800 text-white"><SelectValue placeholder="Select Category" /></SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                {INITIAL_CATEGORIES.map(c => (
                                  <SelectItem key={c.id} value={c.id} className="focus:bg-indigo-600">{c.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Platform Name</Label>
                            <Input placeholder="e.g. Twitter, Discord, Twitch" value={newSocial.name} onChange={(e) => setNewSocial({...newSocial, name: e.target.value})} className="bg-slate-900 border-slate-800" />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Profile URL</Label>
                            <Input placeholder="https://..." value={newSocial.url} onChange={(e) => setNewSocial({...newSocial, url: e.target.value})} className="bg-slate-900 border-slate-800" />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Platform Icon (PNG/JPEG)</Label>
                            <div className="flex items-center gap-4">
                              <Button variant="outline" onClick={() => socialIconRef.current?.click()} className="bg-slate-900 border-slate-800 text-slate-300"><Camera size={16} className="mr-2" /> Upload Icon</Button>
                              {newSocial.icon && <div className="w-10 h-10 rounded bg-slate-900 border border-slate-800 p-1"><img src={newSocial.icon} alt="Preview" className="w-full h-full object-contain" /></div>}
                            </div>
                            <input type="file" ref={socialIconRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'social')} />
                          </div>
                        </div>
                        <DialogFooter><Button onClick={handleAddSocial} className="w-full bg-indigo-600 font-black uppercase py-6">ATTACH LINK</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-8 mt-16">
          <LayoutSettings sections={profileLayout} onUpdate={updateProfileLayout} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {profileLayout
              .filter(s => ['career_overview', 'medals'].includes(s.id))
              .map(s => renderSection(s.id))}
          </div>

          <div className="space-y-6">
            {profileLayout
              .filter(s => ['profile_stats'].includes(s.id))
              .map(s => renderSection(s.id))}
          </div>
        </div>
        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10"><MadeWithDyad /></footer>
      </main>
    </AppLayout>
  );
};

export default Profile;