"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  User, Edit3, Save, Camera, Loader2, ImageIcon, Shield, ChevronRight, Globe, Zap, Target, Activity, Download, Check
} from 'lucide-react';
import ProfileGallery from '@/components/ProfileGallery';
import ProfileEquipment from '@/components/ProfileEquipment';
import ProfileExportCard from '@/components/ProfileExportCard';
import AppLayout from '@/components/AppLayout';
import { processImage } from '@/utils/imageProcessing';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

const Profile = () => {
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [primaryTeam, setPrimaryTeam] = useState<any>(null);
  const [socials, setSocials] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [userGames, setUserGames] = useState<any[]>([]);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      setEditedProfile({ ...profile });
      fetchPrimaryTeam();
      fetchSocials();
      fetchUserGames();
    } else if (user && !profileLoading) {
      setEditedProfile({
        username: user.email?.split('@')[0] || 'Operator',
        avatar_url: null,
        banner_url: null,
        main_game: '',
        region: '',
        bio: '',
        level: 1,
        sensitivity: '',
        peripherals: []
      });
    }
  }, [profile, user, profileLoading]);

  const fetchUserGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*, game_modes(*)')
      .eq('user_id', user?.id);
    if (data) {
      setUserGames(data);
      setSelectedGameIds(data.slice(0, 4).map(g => g.id));
    }
  };

  const fetchPrimaryTeam = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('teams(*)')
      .eq('user_id', user?.id)
      .eq('is_primary', true)
      .single();
    
    if (data) setPrimaryTeam(data.teams);
  };

  const fetchSocials = () => {
    const saved = JSON.parse(localStorage.getItem('combat_socials') || '[]');
    setSocials(saved);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: editedProfile.username,
          avatar_url: editedProfile.avatar_url,
          banner_url: editedProfile.banner_url,
          main_game: editedProfile.main_game,
          region: editedProfile.region,
          bio: editedProfile.bio,
          sensitivity: editedProfile.sensitivity,
          peripherals: editedProfile.peripherals,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      await refreshProfile();
      setIsEditing(false);
      showSuccess("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      showError("Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      // Wait a moment for images to load in the hidden card
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#020617',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = `${editedProfile.username}_combat_card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showSuccess("Player card exported.");
      setIsExportDialogOpen(false);
    } catch (err) {
      console.error("Export error:", err);
      showError("Export failed. Ensure all images are loaded.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImage(file, type === 'avatar' ? 400 : 1920, type === 'avatar' ? 400 : 600, 0.8);
        setEditedProfile({ ...editedProfile, [type === 'avatar' ? 'avatar_url' : 'banner_url']: processed });
        showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} processed. Save to confirm.`);
      } catch (err) {
        showError("Failed to process image.");
      }
    }
  };

  const toggleGameSelection = (id: string) => {
    setSelectedGameIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (profileLoading || !editedProfile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      </AppLayout>
    );
  }

  const displayProfile = profile || editedProfile;
  const selectedGamesForExport = userGames.filter(g => selectedGameIds.includes(g.id));

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-10">
        {/* Hidden Export Card */}
        <ProfileExportCard 
          profile={displayProfile} 
          socials={socials} 
          selectedGames={selectedGamesForExport} 
          exportRef={exportRef} 
        />

        {/* Banner Section */}
        <div className="relative h-48 md:h-80 rounded-[2.5rem] overflow-hidden border border-slate-800 bg-slate-900 group">
          {editedProfile.banner_url ? (
            <img src={editedProfile.banner_url} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-900/40 to-violet-900/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
          
          {/* Social Tags Overlay */}
          <div className="absolute top-6 left-6 flex flex-wrap gap-2 max-w-[70%]">
            {socials.map((s, i) => (
              <div key={i} className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                <Globe size={12} className="text-indigo-400" />
                {s.name}
              </div>
            ))}
            {displayProfile.main_game && (
              <div className="px-3 py-1.5 rounded-full bg-indigo-600/40 backdrop-blur-md border border-indigo-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                <Target size={12} />
                {displayProfile.main_game}
              </div>
            )}
          </div>

          {isEditing && (
            <button 
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 text-white p-3 rounded-2xl backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <ImageIcon size={16} />
              Change Banner
            </button>
          )}
          <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />

          <div className="absolute -bottom-1 left-10 flex items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-slate-800 border-8 border-[#020617] flex items-center justify-center overflow-hidden shadow-2xl">
                {editedProfile.avatar_url ? (
                  <img src={editedProfile.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-slate-600" />
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"
                >
                  <Camera className="text-white" size={24} />
                </button>
              )}
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
            </div>
          </div>
        </div>

        {/* Identity & Equipment Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-4">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                {isEditing ? (
                  <Input 
                    value={editedProfile.username}
                    onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                    className="bg-slate-950/50 border-slate-700 text-3xl md:text-5xl font-black uppercase tracking-tighter text-white h-16 w-full md:w-96"
                  />
                ) : (
                  <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase">{displayProfile.username}</h1>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <Badge className="bg-indigo-600 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">Level {displayProfile.level || 1}</Badge>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Operator ID: {user?.id.slice(0, 8)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-slate-800 text-slate-400 hover:text-white h-12 px-6 text-[10px] font-black uppercase tracking-widest gap-2"
                    >
                      <Download size={14} />
                      Export Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="italic uppercase font-black">Export Player Card</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select up to 4 games to display on your card:</p>
                      <div className="grid grid-cols-2 gap-4">
                        {userGames.map((game) => (
                          <div 
                            key={game.id} 
                            onClick={() => toggleGameSelection(game.id)}
                            className={cn(
                              "p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between",
                              selectedGameIds.includes(game.id) ? "bg-indigo-600/20 border-indigo-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                            )}
                          >
                            <span className="text-xs font-black uppercase italic">{game.title}</span>
                            {selectedGameIds.includes(game.id) && <Check size={16} className="text-indigo-400" />}
                          </div>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleExport} 
                        disabled={isExporting || selectedGameIds.length === 0}
                        className="w-full bg-indigo-600 font-black uppercase py-6"
                      >
                        {isExporting ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                        Generate PNG
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setEditedProfile(profile ? { ...profile } : editedProfile);
                      }}
                      className="border-slate-800 text-slate-400 hover:text-white h-12 px-6 text-[10px] font-black uppercase tracking-widest"
                    >
                      Abort
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-[10px] font-black uppercase tracking-widest gap-2"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                      Confirm
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 text-[10px] font-black uppercase tracking-widest gap-2"
                  >
                    <Edit3 size={14} />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Operational Bio</h3>
              {isEditing ? (
                <textarea 
                  value={editedProfile.bio || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                  className="w-full bg-slate-900/30 border border-slate-800 rounded-3xl p-6 text-sm text-slate-300 focus:ring-indigo-500 min-h-[120px]"
                  placeholder="Enter your operator bio..."
                />
              ) : (
                <p className="text-slate-400 text-sm leading-relaxed bg-slate-900/20 border border-slate-800/50 rounded-3xl p-6">
                  {displayProfile.bio || "No operational bio provided. Update your profile to add one."}
                </p>
              )}
            </section>
          </div>

          <div className="space-y-8">
            {primaryTeam && (
              <Link to={`/team/${primaryTeam.id}`}>
                <div className="p-6 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Primary Unit</span>
                    <ChevronRight size={16} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                      {primaryTeam.icon_url ? <img src={primaryTeam.icon_url} className="w-full h-full object-cover" /> : <Shield size={24} className="text-indigo-500" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-black italic uppercase tracking-tight text-white">
                        <span className="text-indigo-400">[{primaryTeam.tag}]</span> {primaryTeam.name}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{primaryTeam.main_game || 'Multi-Game'}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            <ProfileEquipment 
              isEditing={isEditing} 
              data={editedProfile} 
              onChange={setEditedProfile} 
            />
          </div>
        </div>

        {/* Gallery Section */}
        <div className="pt-10 border-t border-slate-800">
          <ProfileGallery />
        </div>
      </main>
    </AppLayout>
  );
};

export default Profile;