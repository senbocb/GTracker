"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Trophy, Target, Zap, 
  Edit3, Save, Camera, Gamepad2, Globe, 
  Plus, Trash2, Share2, Download, Check, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setEditedProfile({ ...profile });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editedProfile.username,
          avatar_url: editedProfile.avatar_url,
          main_game: editedProfile.main_game,
          region: editedProfile.region,
          bio: editedProfile.bio,
          custom_stats: editedProfile.custom_stats
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile || !editedProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-slate-800 border-4 border-slate-950 flex items-center justify-center overflow-hidden shadow-2xl">
                {editedProfile.avatar_url ? (
                  <img src={editedProfile.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-slate-600" />
                )}
              </div>
              {isEditing && (
                <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <Camera className="text-white" size={24} />
                </button>
              )}
            </div>
            <div className="mb-4">
              {isEditing ? (
                <Input 
                  value={editedProfile.username}
                  onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                  className="bg-slate-950/50 border-slate-700 text-2xl font-black uppercase tracking-tighter text-white h-12 w-64"
                />
              ) : (
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">{profile.username}</h1>
              )}
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-indigo-600 text-white border-none text-[10px] font-black uppercase tracking-widest">Level {profile.level || 1}</Badge>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Operator ID: {profile.id.slice(0, 8)}</span>
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
                    setEditedProfile({...profile});
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
        <div className="pt-20 pb-8 px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Operational Bio</h3>
                {isEditing ? (
                  <textarea 
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                    className="w-full bg-slate-950/30 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:ring-indigo-500 min-h-[100px]"
                    placeholder="Enter your operator bio..."
                  />
                ) : (
                  <p className="text-slate-400 text-sm leading-relaxed bg-slate-950/30 border border-slate-800/50 rounded-xl p-4">
                    {profile.bio || "No operational bio provided. Update your profile to add one."}
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
                      <span className="text-[10px] font-black uppercase text-white">{profile.main_game || 'N/A'}</span>
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
                      <span className="text-[10px] font-black uppercase text-white">{profile.region || 'Global'}</span>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;