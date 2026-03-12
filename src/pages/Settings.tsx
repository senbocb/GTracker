"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Settings as SettingsIcon, Bell, Shield, Monitor, Palette, Image as ImageIcon, Trash2, Plus, GripVertical, Download, FileSpreadsheet, AlertTriangle, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { showSuccess, showError } from '@/utils/toast';
import { processImage } from '@/utils/imageProcessing';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    highContrast: false,
    compactDashboard: true,
    rankAlerts: true,
    sessionReminders: false,
    seasonGoal: '',
    tacticalOverlay: false
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
    if (saved) setSettings(saved);

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
    showSuccess("Configuration updated.");
  };

  const updateCustomization = (key: keyof typeof customization, value: string) => {
    const newCustom = { ...customization, [key]: value };
    setCustomization(newCustom);
    localStorage.setItem('combat_customization', JSON.stringify(newCustom));
    showSuccess("Visual theme updated.");
  };

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImage(file, 1920, 1080, 0.6);
        updateCustomization('bgImage', processed);
      } catch (err) {
        showError("Failed to process image.");
      }
    }
  };

  const exportData = () => {
    try {
      const games = JSON.parse(localStorage.getItem('combat_games') || '[]');
      let csvContent = "Game,Mode,Rank,Tier,Timestamp\n";
      games.forEach((game: any) => {
        game.modes.forEach((mode: any) => {
          (mode.history || []).forEach((log: any) => {
            csvContent += `"${game.title}","${mode.name}","${log.rank}","${log.tier || ''}","${log.timestamp}"\n`;
          });
        });
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `gtracker_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess("Data exported successfully.");
    } catch (err) {
      showError("Failed to export data.");
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
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-3xl mx-auto p-6 md:p-10">
        <Link to="/"><Button variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4 hover-highlight"><ChevronLeft className="mr-2" size={20} /> Back to Dashboard</Button></Link>

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">Settings</h1>
          <p className="text-slate-400 font-medium">Adjust your interface and data preferences.</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2 text-white"><Palette className="text-indigo-500" size={20} /> Customization</CardTitle></CardHeader>
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

          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2 text-white"><Download className="text-indigo-500" size={20} /> Data Management</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-white">Export History</Label>
                  <p className="text-sm text-slate-400">Download your match history and stats as a CSV file.</p>
                </div>
                <Button onClick={exportData} className="bg-indigo-600 hover:bg-indigo-500"><FileSpreadsheet className="mr-2" size={18} /> Export CSV</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2 text-white"><Monitor className="text-indigo-500" size={20} /> Interface</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-white">Tactical Overlay</Label>
                  <p className="text-sm text-slate-400">Apply scanlines and CRT effects for a command center vibe.</p>
                </div>
                <Switch checked={settings.tacticalOverlay} onCheckedChange={(v) => updateSetting('tacticalOverlay', v)} />
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