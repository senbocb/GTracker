"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Settings, Trophy, Target, Zap, 
  Edit3, Save, Camera, Gamepad2, Globe, 
  Plus, Trash2, Share2, Download, Check, Loader2,
  Activity, Calendar, BarChart3, Map as MapIcon, RefreshCw, Eye, EyeOff, Shield
} from 'lucide-react';
import RankBadge from '@/components/RankBadge';
import ProgressChart from '@/components/ProgressChart';
import ProfileGallery from '@/components/ProfileGallery';
import AppLayout from '@/components/AppLayout';
import { processImage } from '@/utils/imageProcessing';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const Profile = () => {
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setEditedProfile({ ...profile });
    } else if (user && !profileLoading) {
      setEditedProfile({
        username: user.email?.split('@')[0] || 'Operator',
        avatar_url: null,
        main_game: '',
        region: '',
        bio: '',
        level: 1
      });
    }
  }, [profile, user, profileLoading]);

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
          main_game: editedProfile.main_game,
          region: editedProfile.region,
          bio: editedProfile.bio,
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImage(file, 400, 400, 0.8);
        setEditedProfile({ ...editedProfile, avatar_url: processed });
        showSuccess("Avatar processed. Save to confirm.");
      } catch (err) {
        showError("Failed to process image.");
      }
    }
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

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto p-4 md:p-10">
        <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden mb-10">
          <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-slate-800 border-4 border-slate-950 flex items-center justify-center overflow-hidden shadow-2xl">
                  {editedProfile.avatar_url ? (
                    <img src={editedProfile.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-slate-600" />
                  )}
                </div>
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"
                  >
                    <Camera className="text-white" size={24} />
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </div>
              <div className="mb-4">
                {isEditing ? (
                  <Input 
                    value={editedProfile.username}
                    onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                    className="bg-slate-950/50 border-slate-700 text-2xl md:text-4xl font-black uppercase tracking-tighter text-white h-12 md:h-16 w-64"
                  />
                ) : (
                  <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase">{displayProfile.username}</h1>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-indigo-600 text-white border-none text-[10px] font-black uppercase tracking-widest">Level {displayProfile.level || 1}</Badge>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Operator ID: {user?.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 right-8 flex gap-3">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile(profile ? { ...profile } : editedProfile);
                    }}
                    className="border-slate-700 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest gap-2"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest gap-2"
                >
                  <Edit3 size={14} />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
          <div className="pt-24 pb-8 px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-950/50 border border-slate-800 p-1 h-auto mb-8">
                <TabsTrigger value="overview" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Overview</TabsTrigger>
                <TabsTrigger value="gallery" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Gallery</TabsTrigger>
                <TabsTrigger value="stats" className="px-8 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-indigo-600">Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Operational Bio</h3>
                      {isEditing ? (
                        <textarea 
                          value={editedProfile.bio || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                          className="w-full bg-slate-950/30 border border-slate-800 rounded-2xl p-6 text-sm text-slate-300 focus:ring-indigo-500 min-h-[150px]"
                          placeholder="Enter your operator bio..."
                        />
                      ) : (
                        <p className="text-slate-400 text-sm leading-relaxed bg-slate-950/30 border border-slate-800/50 rounded-2xl p-6">
                          {displayProfile.bio || "No operational bio provided. Update your profile to add one."}
                        </p>
                      )}
                    </section>

                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Combat Stats</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Matches', value: '142', icon: <Target size={16} /> },
                          { label: 'Win Rate', value: '58%', icon: <Zap size={16} /> },
                          { label: 'MVP Count', value: '24', icon: <Trophy size={16} /> },
                          { label: 'Rank', value: 'Elite', icon: <Shield size={16} /> },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-center">
                            <div className="text-indigo-500 flex justify-center mb-2">{stat.icon}</div>
                            <div className="text-xl font-black text-white">{stat.value}</div>
                            <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Deployment Info</h3>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-slate-400">
                            <Gamepad2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Main Game</span>
                          </div>
                          {isEditing ? (
                            <Input 
                              value={editedProfile.main_game || ''}
                              onChange={(e) => setEditedProfile({...editedProfile, main_game: e.target.value})}
                              className="bg-slate-900 border-slate-700 h-8 w-32 text-[10px] font-bold uppercase"
                            />
                          ) : (
                            <span className="text-[10px] font-black uppercase text-white">{displayProfile.main_game || 'N/A'}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-slate-400">
                            <Globe size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Region</span>
                          </div>
                          {isEditing ? (
                            <Input 
                              value={editedProfile.region || ''}
                              onChange={(e) => setEditedProfile({...editedProfile, region: e.target.value})}
                              className="bg-slate-900 border-slate-700 h-8 w-32 text-[10px] font-bold uppercase"
                            />
                          ) : (
                            <span className="text-[10px] font-black uppercase text-white">{displayProfile.region || 'Global'}</span>
                          )}
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gallery">
                <ProfileGallery />
              </TabsContent>

              <TabsContent value="stats">
                <div className="grid grid-cols-1 gap-8">
                  <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] flex items-center justify-center border border-dashed border-slate-800 rounded-2xl">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Select a game to view detailed trajectory</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default Profile;