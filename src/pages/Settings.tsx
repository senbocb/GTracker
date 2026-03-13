"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Settings as SettingsIcon, Bell, Shield, Monitor, Palette, Image as ImageIcon, Trash2, Plus, GripVertical, Download, FileSpreadsheet, AlertTriangle, Check, Layout, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { showSuccess, showError } from '@/utils/toast';
import { processImage } from '@/utils/imageProcessing';
import { cn } from '@/lib/utils';

const UI_PRESETS = [
  { id: 'tactical', name: 'Tactical Command', primary: '#6366f1', bg: '#020617', description: 'Standard issue indigo interface.' },
  { id: 'stealth', name: 'Stealth Ops', primary: '#10b981', bg: '#09090b', description: 'Low-profile emerald green design.' },
  { id: 'valor', name: 'Valor Red', primary: '#ef4444', bg: '#0a0a0a', description: 'High-intensity combat red.' },
  { id: 'cyber', name: 'Cyber Neon', primary: '#d946ef', bg: '#050505', description: 'Vibrant fuchsia cyberpunk aesthetic.' },
  { id: 'frost', name: 'Frost Bite', primary: '#0ea5e9', bg: '#020617', description: 'Cool cyan arctic configuration.' },
  { id: 'desert', name: 'Desert Storm', primary: '#f59e0b', bg: '#1c1917', description: 'Amber-toned tactical environment.' }
];

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    highContrast: false,
    compactDashboard: true,
    rankAlerts: true,
    sessionReminders: false,
    seasonGoal: '',
    tacticalOverlay: false,
    uiPreset: 'tactical'
  });

  const [customization, setCustomization] = useState({
    bgColor: '#020617',
    bgImage: ''
  });

  const [profile, setProfile] = useState<any>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [confirmUsername, setConfirmUsername] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_settings') || 'null');
    if (saved) {
      setSettings(saved);
      if (saved.uiPreset) {
        document.body.setAttribute('data-theme', saved.uiPreset);
      }
      if (saved.tacticalOverlay) {
        document.body.classList.add('tactical-overlay', 'scanline-effect');
      }
    }

    const savedCustom = JSON.parse(localStorage.getItem('combat_customization') || 'null');
    if (savedCustom) setCustomization(savedCustom);

    const savedProfile = JSON.parse(localStorage.getItem('combat_profile') || 'null');
    setProfile(savedProfile);
  }, []);

  const updateSetting = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('combat_settings', JSON.stringify(newSettings));
    
    if (key === 'tacticalOverlay') {
      document.body.classList.toggle('tactical-overlay', value);
      document.body.classList.toggle('scanline-effect', value);
    }

    if (key === 'uiPreset') {
      document.body.setAttribute('data-theme', value);
      const preset = UI_PRESETS.find(p => p.id === value);
      if (preset) {
        updateCustomization('bgColor', preset.bg);
      }
    }
    
    showSuccess("Configuration updated.");
  };

  const updateCustomization = (key: keyof typeof customization, value: string) => {
    const newCustom = { ...customization, [key]: value };
    setCustomization(newCustom);
    localStorage.setItem('combat_customization', JSON.stringify(newCustom));
  };

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImage(file, 1920, 1080, 0.6);
        updateCustomization('bgImage', processed);
        showSuccess("Background image updated.");
      } catch (err) {
        showError("Failed to process image.");
      }
    }
  };

  const handleFullReset = () => {
    if (confirmUsername !== profile?.username) {
      showError("Username mismatch. Reset aborted.");
      return;
    }
    localStorage.clear();
    showSuccess("All data purged. System reset.");
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-3xl mx-auto p-6 md:p-10">
        <Link to="/"><Button variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4 hover-highlight"><ChevronLeft className="mr-2" size={20} /> Back to Dashboard</Button></Link>

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">Settings</h1>
          <p className="text-slate-400 font-medium">Adjust your interface and data preferences.</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                <Layout className="text-primary" size={20} /> 
                UI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-300 tracking-widest">Visual Preset</Label>
                  <Select value={settings.uiPreset} onValueChange={(v) => updateSetting('uiPreset', v)}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-14 text-white">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm" 
                          style={{ backgroundColor: UI_PRESETS.find(p => p.id === settings.uiPreset)?.primary }} 
                        />
                        <SelectValue placeholder="Select a theme" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {UI_PRESETS.map(preset => (
                        <SelectItem key={preset.id} value={preset.id}>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <div className="flex flex-col">
                              <span className="font-bold uppercase text-[10px] tracking-widest">{preset.name}</span>
                              <span className="text-[8px] text-slate-500">{preset.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-white">Tactical Overlay</Label>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Scanlines & CRT effects</p>
                  </div>
                  <Switch checked={settings.tacticalOverlay} onCheckedChange={(v) => updateSetting('tacticalOverlay', v)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2 text-white"><Palette className="text-primary" size={20} /> Customization</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold text-white">Background Color</Label>
                    <p className="text-sm text-slate-400">Set a custom base color for the interface.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-300 uppercase">{customization.bgColor}</span>
                    <Input type="color" value={customization.bgColor} onChange={(e) => updateCustomization('bgColor', e.target.value)} className="w-12 h-12 p-1 bg-slate-950 border-slate-800 cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold text-white">Background Image</Label>
                      <p className="text-sm text-slate-400">Upload a PNG or JPEG to use as a global background.</p>
                    </div>
                    <div className="flex gap-2">
                      {customization.bgImage && <Button variant="destructive" size="icon" onClick={() => updateCustomization('bgImage', '')} className="h-10 w-10"><Trash2 size={16} /></Button>}
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white"><ImageIcon className="mr-2" size={16} />{customization.bgImage ? 'Change Image' : 'Upload Image'}</Button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handleBgImageUpload} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-950/20 border-red-900/50 shadow-2xl">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2 text-red-500"><AlertTriangle size={20} /> Danger Zone</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-white">Reset Profile</Label>
                  <p className="text-sm text-slate-400">Permanently delete all games, history, and profile data.</p>
                </div>
                <Dialog open={isResetOpen} onOpenChange={(v) => { setIsResetOpen(v); if(!v) { setResetStep(1); setConfirmUsername(''); } }}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-500">Reset All Data</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-950 border-slate-800 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black uppercase italic flex items-center gap-2 text-red-500">
                        <AlertTriangle /> {resetStep === 1 ? 'CRITICAL WARNING' : 'AUTHORIZE PURGE'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                      {resetStep === 1 ? (
                        <div className="space-y-4">
                          <p className="text-sm text-slate-300">This action is <span className="text-red-500 font-bold">PERMANENT</span>. All tracked games, match history, screenshots, and settings will be destroyed.</p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Are you absolutely sure you want to proceed?</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-slate-300">To confirm, please type your username: <span className="text-indigo-400 font-black italic">{profile?.username}</span></p>
                          <Input 
                            value={confirmUsername} 
                            onChange={(e) => setConfirmUsername(e.target.value)} 
                            placeholder="Type username here..." 
                            className="bg-slate-900 border-slate-800"
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      {resetStep === 1 ? (
                        <Button onClick={() => setResetStep(2)} className="w-full bg-red-600 hover:bg-red-500 font-black uppercase py-6">I UNDERSTAND, PROCEED</Button>
                      ) : (
                        <Button 
                          onClick={handleFullReset} 
                          disabled={confirmUsername !== profile?.username}
                          className="w-full bg-red-600 hover:bg-red-500 font-black uppercase py-6 disabled:opacity-50"
                        >
                          CONFIRM FULL RESET
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;