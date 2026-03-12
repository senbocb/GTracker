"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor, Download, ShieldCheck, HardDrive, Cpu, Zap } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const ClientDownload = () => {
  const handleDownload = () => {
    showSuccess("Initializing GTracker_Setup_v1.0.4.exe...");
    // In a real scenario, this would be: window.location.href = '/downloads/gtracker-setup.exe';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all">
          <Monitor className="mr-2" size={16} />
          GET CLIENT
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Zap className="text-indigo-500" />
            GTracker Desktop
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="aspect-video rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent" />
            <Monitor size={64} className="text-slate-800" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Local Storage Protocol</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Data Directory: %APPDATA%/GTracker</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
              <ShieldCheck className="text-emerald-500" size={20} />
              <h4 className="text-xs font-black uppercase">Zero Latency</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">Optimized for background operation during high-intensity combat.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
              <HardDrive className="text-blue-500" size={20} />
              <h4 className="text-xs font-black uppercase">Local Vault</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">All intel is stored locally in the GTracker system folder.</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>System Requirements</span>
              <span className="text-indigo-400">v1.0.4 Stable</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu size={14} className="text-slate-600" />
                <span className="text-[10px] font-bold text-slate-400">Windows 10/11 x64</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600">64.2 MB</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleDownload} className="w-full bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-8 rounded-2xl text-lg shadow-xl shadow-indigo-600/20">
            <Download className="mr-2" />
            DOWNLOAD .EXE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDownload;