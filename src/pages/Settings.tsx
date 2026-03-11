"use client";

import React, { useEffect, useState, useRef } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, Settings as SettingsIcon, Bell, Shield, Monitor, Palette, Image as ImageIcon, Trash2, Plus, GripVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from '@/utils/toast';
import { processImage } from '@/utils/imageProcessing';

const Settings = () => {
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_settings') || 'null');
    if (saved) setSettings(saved);

    const savedCustom = JSON.parse(localStorage.getItem('combat_customization') || 'null');
    if (savedCustom) setCustomization(savedCustom);
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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-3xl mx-auto p-6 md:p-10">
        <Link to="/"><Button variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4 hover-highlight"><ChevronLeft className="mr-2" size={20} /> Back to Dashboard</Button></Link>

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">SYSTEM CONFIGURATION</h1>
          <p className="text-slate-400 font-medium">Adjust your interface and tracking parameters.</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2 text-white"><Palette className="text-indigo-500" size={20} /> CUSTOMIZATION</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold text-white">Background Color</Label>
                    <p className="text-sm text-slate-400">Set a custom base color for the interface.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-300 uppercase">{customization.bgColor}</span>
                    <Input 
                      type="color" 
                      value={customization.bgColor} 
                      onChange={(e) => updateCustomization('bgColor', e.target.value)}
                      className="w-12 h-12 p-1 bg-slate-950 border-slate-800 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold text-white">Background Image</Label>
                      <p className="text-sm text-slate-400">Upload a PNG or JPEG to use as a global background.</p>
                    </div>
                    <div className="flex gap-2">
                      {customization.bgImage && (
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => updateCustomization('bgImage', '')}
                          className="h-10 w-10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-slate-800 bg-slate-950 text-slate-300 hover:text-white"
                      >
                        <ImageIcon className="mr-2" size={16} />
                        {customization.bgImage ? 'Change Image' : 'Upload Image'}
                      </Button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png, image/jpeg" 
                      onChange={handleBgImageUpload} 
                    />
                  </div>
                  
                  {customization.bgImage && (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={customization.bgImage} alt="Background Preview" className="w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Background Active</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2 text-white"><Monitor className="text-indigo-500" size={20} /> INTERFACE</CardTitle></CardHeader>
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
        </div>
        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10"><MadeWithDyad /></footer>
      </main>
    </div>
  );
};

export default Settings;