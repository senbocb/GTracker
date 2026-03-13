"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Shield, Target, Zap, Award, ChevronLeft, Camera, Edit2, Check, X, Plus, ExternalLink, Settings2, Globe, Medal, Star, Trophy, Gamepad2, Link as LinkIcon, Trash2, BarChart3, Share2, UserCircle, Calendar, Search, Filter, Layout, Image as ImageIcon, MousePointer2, Sparkles, RefreshCw, Activity, Download, Share, FileImage, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { showSuccess, showError } from '@/utils/toast';
import { cn } from "@/lib/utils";
import AppLayout from '@/components/AppLayout';
import { processImage } from '@/utils/imageProcessing';
import LayoutSettings, { LayoutSection } from '@/components/LayoutSettings';
import ProfileGallery from '@/components/ProfileGallery';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { getIconFromUrl, SOCIAL_PRESETS } from '@/utils/iconFetcher';
import RankBadge from '@/components/RankBadge';
import html2canvas from 'html2canvas';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

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
  { id: 'activity_heatmap', label: 'Activity History', enabled: true },
  { id: 'medals', label: 'Medals & Achievements', enabled: true },
  { id: 'profile_gallery', label: 'Screenshots & Gallery', enabled: true },
  { id: 'profile_stats', label: 'Profile Stats', enabled: true },
];

const Profile = () => {
  const { user, profile: globalProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    showCurrent: true,
    showPeak: true,
    showSocials: true,
    showStats: true,
    showProfiles: true
  });

  const [profile, setProfile] = useState({
    username: 'OPERATOR',
    avatar_url: '',
    banner_url: '',
    createdAt: new Date().toISOString(),
    xp: 0,
    country: 'United States',
    countryFlag: '🇺🇸',
    sensitivity: '',
    age: ''
  });

  const [socials, setSocials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(INITIAL_CATEGORIES);
  const [games, setGames] = useState<any[]>([]);
  const [profileLayout, setProfileLayout] = useState<LayoutSection[]>(DEFAULT_PROFILE_LAYOUT);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [newSocial, setNewSocial] = useState({ name: '', url: '', icon: '', category: 'socials', gameId: '' });
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const socialIconRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sync local state with global profile when not editing
  useEffect(() => {
    if (globalProfile && !isEditing) {
      setProfile({
        username: globalProfile.username || 'OPERATOR',
        avatar_url: globalProfile.avatar_url || '',
        banner_url: globalProfile.banner_url || '',
        createdAt: globalProfile.updated_at,
        xp: globalProfile.xp || 0,
        country: globalProfile.country || 'United States',
        countryFlag: globalProfile.country_flag || '🇺🇸',
        sensitivity: globalProfile.sensitivity || '',
        age: ''
      });
    }
  }, [globalProfile, isEditing]);

  useEffect(() => {
    const savedSocials = JSON.parse(localStorage.getItem('combat_socials') || '[]');
    setSocials(savedSocials);
    const savedGames = JSON.parse(localStorage.getItem('combat_games') || '[]');
    setGames(savedGames);
    const savedLayout = JSON.parse(localStorage.getItem('combat_profile_layout') || 'null');
    if (savedLayout) setProfileLayout(savedLayout);
    const savedFavs = JSON.parse(localStorage.getItem('combat_achievement_favs') || '[]');
    setFavorites(savedFavs);
  }, []);

  const handleExport = async () => {
    if (!exportRef.current) return;
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#020617',
        scale: 2,
        useCORS: true,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `${profile.username}_profile.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showSuccess("Profile image generated.");
      setIsExportOpen(false);
    } catch (err) {
      showError("Export failed.");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          country: profile.country,
          country_flag: profile.countryFlag,
          sensitivity: profile.sensitivity,
          avatar_url: profile.avatar_url,
          banner_url: profile.banner_url
        })
        .eq('id', user.id);
      
      if (error) throw error;

      setIsEditing(false);
      showSuccess("Profile updated across all devices.");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner' | 'social') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImage(file, type === 'banner' ? 1200 : 400, type === 'banner' ? 600 : 400, 0.7);
        if (type === 'social') setNewSocial({ ...newSocial, icon: processed });
        else {
          const field = type === 'avatar' ? 'avatar_url' : 'banner_url';
          setProfile(prev => ({ ...prev, [field]: processed }));
          
          // Auto-save image to Supabase
          if (user) {
            await supabase.from('profiles').update({ [field]: processed }).eq('id', user.id);
            showSuccess(`${type} updated.`);
          }
        }
      } catch (err) { showError(`Failed to process ${type}.`); }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const isActiveCategory = categories.some(c => c.id === active.id);
    if (isActiveCategory) {
      setCategories((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
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
  };

  const level = Math.floor(profile.xp / 100) + 1;
  const groupedSocials = useMemo(() => {
    const groups: Record<string, any[]> = { stat_trackers: [], socials: [], game_profiles: [] };
    socials.forEach(s => { if (groups[s.category || 'socials']) groups[s.category || 'socials'].push(s); });
    return groups;
  }, [socials]);

  const renderSection = (id: string) => {
    const section = profileLayout.find(s => s.id === id);
    if (!section || !section.enabled) return null;
    switch (id) {
      case 'career_overview':
        return (
          <section key="career_overview" className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="text-indigo-500" size={20} /> Career Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 group relative hover:border-indigo-500/30 transition-colors backdrop-blur-sm">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Total Updates</p>
                <p className="text-xl font-black text-white">{games.reduce((acc, g) => acc + g.modes.reduce((mAcc: number, m: any) => mAcc + (m.history?.length || 0), 0), 0)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 group relative hover:border-indigo-500/30 transition-colors backdrop-blur-sm">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Games Tracked</p>
                <p className="text-xl font-black text-white">{games.length}</p>
              </div>
            </div>
          </section>
        );
      case 'activity_heatmap': return <ActivityHeatmap key="activity_heatmap" />;
      case 'medals': return (
        <section key="medals" className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Medal className="text-yellow-500" size={20} /> Medals & Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favorites.map(id => {
              const medal = [...peakAchievements, { id: 'recruit', label: 'Recruit', icon: <User size={20} />, minLevel: 1, color: 'text-slate-300' }].find(m => m.id === id);
              if (!medal) return null;
              return (
                <div key={medal.id} className="p-4 rounded-2xl border border-yellow-500/50 bg-slate-900/90 flex flex-col items-center text-center gap-2 backdrop-blur-sm">
                  <div className={cn("w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center shadow-lg", medal.color)}>{medal.icon}</div>
                  <p className="text-xs font-black uppercase tracking-tighter text-white">{medal.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      );
      case 'profile_gallery': return <ProfileGallery key="profile_gallery" />;
      case 'profile_stats': return (
        <section key="profile_stats" className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Profile Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-300 uppercase">Joined</span><span className="text-sm font-black text-white">{new Date(profile.createdAt).toLocaleDateString()}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-300 uppercase">Country</span><span className="text-sm font-black text-white flex items-center gap-2"><span>{profile.countryFlag}</span><span>{profile.country}</span></span></div>
            <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-300 uppercase">Sensitivity</span><span className="text-sm font-black text-indigo-400">{profile.sensitivity ? `${profile.sensitivity} cm/360` : 'N/A'}</span></div>
          </div>
        </section>
      );
      default: return null;
    }
  };

  const peakAchievements = useMemo(() => {
    return games.flatMap(game => game.modes.filter((m: any) => {
      const r = m.peakRank?.toLowerCase() || "";
      return r === 'radiant' || r === 'top 500' || r === 'challenger' || r === 'apex predator';
    }).map((m: any) => ({ id: `master_${game.id}_${m.name}`, label: `${game.title} Master`, icon: <Trophy size={20} />, unlocked: true, color: 'text-indigo-400 rainbow-gradient', date: 'Peak Achieved' })));
  }, [games]);

  return (
    <AppLayout>
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <Link to="/"><Button variant="ghost" className="text-slate-300 hover:text-white -ml-4 hover-highlight"><ChevronLeft className="mr-2" size={20} /> Back</Button></Link>
          <Button onClick={() => setIsExportOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 font-black uppercase">
            <FileImage className="mr-2" size={18} /> Download Profile
          </Button>
        </div>

        <div className="relative mb-12">
          <div className="h-48 w-full rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden relative backdrop-blur-sm">
            {profile.banner_url ? <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent" />}
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-300 hover:text-white bg-slate-950/50 rounded-full h-10 w-10" onClick={() => bannerInputRef.current?.click()}><Camera size={18} /></Button>
            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
          </div>
          <div className="absolute -bottom-10 left-8 flex items-end gap-6 w-[calc(100%-4rem)]">
            <div className="w-32 h-32 rounded-3xl bg-slate-950 border-4 border-[#020617] flex items-center justify-center shadow-2xl group cursor-pointer relative overflow-hidden shrink-0" onClick={() => avatarInputRef.current?.click()}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : <User size={64} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera size={24} className="text-white" /></div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
            </div>
            <div className="pb-4 flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3 max-w-md animate-in fade-in slide-in-from-left-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-[10px] font-bold uppercase text-slate-400">Username</Label><Input value={profile.username} onChange={(e) => setProfile({...profile, username: e.target.value})} className="bg-slate-900 border-slate-800 text-white font-black italic h-10" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-bold uppercase text-slate-400">Country</Label><Select onValueChange={(v) => { const c = COUNTRIES.find(x => x.name === v); if(c) setProfile({...profile, country: c.name, countryFlag: c.flag}); }} value={profile.country}><SelectTrigger className="bg-slate-900 border-slate-800 text-white h-10"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-900 border-slate-800 text-white">{COUNTRIES.map(c => <SelectItem key={c.name} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 font-bold">
                      {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} className="mr-1" />} Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div onClick={() => setIsEditing(true)} className="cursor-pointer group inline-block"><h1 className="text-3xl font-black tracking-tight text-white italic uppercase truncate group-hover:text-indigo-400 transition-colors flex items-center gap-3">{profile.username}<Edit2 size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" /></h1></div>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Level {level} Operator</p>
                  <div className="flex flex-wrap items-start gap-6 max-w-full overflow-hidden">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={categories.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                        {categories.map(cat => {
                          const items = groupedSocials[cat.id];
                          if (items.length === 0 && cat.id !== 'socials') return null;
                          return <SortableCategory key={cat.id} category={cat} items={items} onRemoveSocial={(id) => { const updated = socials.filter(s => s.id !== id); setSocials(updated); localStorage.setItem('combat_socials', JSON.stringify(updated)); }} onAddClick={() => setIsAddingSocial(true)} showAddButton={cat.id === 'socials'} />;
                        })}
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="md:col-span-2 space-y-8">{profileLayout.filter(s => ['career_overview', 'activity_heatmap', 'medals', 'profile_gallery'].includes(s.id)).map(s => renderSection(s.id))}</div>
          <div className="space-y-6">{profileLayout.filter(s => ['profile_stats'].includes(s.id)).map(s => renderSection(s.id))}</div>
        </div>

        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[700px] p-0 overflow-hidden">
            <div className="bg-slate-900 p-6 border-b border-slate-800">
              <DialogHeader><DialogTitle className="text-xl font-black italic uppercase tracking-tight">Export Profile Image</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2"><Checkbox checked={exportConfig.showCurrent} onCheckedChange={(v) => setExportConfig({...exportConfig, showCurrent: !!v})} /><Label className="text-[10px] font-bold uppercase">Current Ranks</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={exportConfig.showPeak} onCheckedChange={(v) => setExportConfig({...exportConfig, showPeak: !!v})} /><Label className="text-[10px] font-bold uppercase">Peak Ranks</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={exportConfig.showSocials} onCheckedChange={(v) => setExportConfig({...exportConfig, showSocials: !!v})} /><Label className="text-[10px] font-bold uppercase">Socials</Label></div>
              </div>
            </div>
            <div className="p-8 bg-[#020617] overflow-auto max-h-[50vh]">
              <div ref={exportRef} className="w-[600px] bg-[#020617] border border-slate-800 rounded-3xl overflow-hidden p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-indigo-500 overflow-hidden shrink-0">{profile.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover" />}</div>
                  <div>
                    <h2 className="text-3xl font-black italic uppercase text-white">{profile.username}</h2>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Level {level} Operator • {profile.countryFlag} {profile.country}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {games.map(game => (
                    <div key={game.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                      <p className="text-[10px] font-black uppercase text-slate-500">{game.title}</p>
                      {game.modes.map((m: any) => (
                        <div key={m.name} className="flex items-center justify-between gap-2">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">{m.name}</span>
                          <div className="flex gap-2">
                            {exportConfig.showCurrent && <RankBadge rank={m.rank} tier={m.tier} gameTitle={game.title} className="scale-75" />}
                            {exportConfig.showPeak && m.peakRank && <div className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-[7px] font-black text-yellow-500 uppercase">Peak: {m.peakRank}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {exportConfig.showSocials && socials.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
                    {socials.map(s => (
                      <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                        {s.icon ? <img src={s.icon} className="w-4 h-4 object-contain" /> : <Globe size={14} className="text-slate-500" />}
                        <span className="text-[10px] font-bold text-white uppercase">{s.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-4 text-center"><p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Generated via GTracker.app</p></div>
              </div>
            </div>
            <DialogFooter className="p-6 bg-slate-900 border-t border-slate-800"><Button onClick={handleExport} className="w-full bg-indigo-600 font-black uppercase py-6"><Download className="mr-2" size={18} /> Download PNG</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingSocial} onOpenChange={setIsAddingSocial}>
          <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[450px]">
            <DialogHeader><DialogTitle className="italic uppercase font-black">Link Platform</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid gap-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Category</Label><Select onValueChange={(v) => setNewSocial({...newSocial, category: v})} value={newSocial.category}><SelectTrigger className="bg-slate-900 border-slate-800 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-900 border-slate-800 text-white">{INITIAL_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Platform Name</Label><Input placeholder="e.g. Twitter, Discord" value={newSocial.name} onChange={(e) => setNewSocial({...newSocial, name: e.target.value})} className="bg-slate-900 border-slate-800 text-white" /></div>
              <div className="grid gap-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Profile URL</Label><Input placeholder="https://..." value={newSocial.url} onChange={(e) => { const icon = getIconFromUrl(e.target.value); setNewSocial({...newSocial, url: e.target.value, icon: icon || newSocial.icon}); }} className="bg-slate-900 border-slate-800 text-white" /></div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Icon</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => socialIconRef.current?.click()} className="bg-slate-900 border-slate-800 text-slate-300"><Camera size={16} className="mr-2" /> Custom</Button>
                  {newSocial.icon && <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 p-2 flex items-center justify-center"><img src={newSocial.icon} className="w-full h-full object-contain" /></div>}
                </div>
                <input type="file" ref={socialIconRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'social')} />
              </div>
            </div>
            <DialogFooter><Button onClick={() => { const updated = [...socials, { ...newSocial, id: Date.now().toString() }]; setSocials(updated); localStorage.setItem('combat_socials', JSON.stringify(updated)); setIsAddingSocial(false); showSuccess("Linked."); }} className="w-full bg-indigo-600 font-black uppercase py-6">Attach Link</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AppLayout>
  );
};

export default Profile;