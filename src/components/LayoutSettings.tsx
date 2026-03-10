"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Layout, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export interface LayoutSection {
  id: string;
  label: string;
  enabled: boolean;
}

interface LayoutSettingsProps {
  sections: LayoutSection[];
  onUpdate: (sections: LayoutSection[]) => void;
}

const LayoutSettings = ({ sections, onUpdate }: LayoutSettingsProps) => {
  const toggleSection = (id: string) => {
    const newSections = sections.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    onUpdate(newSections);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSections.length) {
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      onUpdate(newSections);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white">
          <Layout className="mr-2" size={16} />
          CUSTOMIZE LAYOUT
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
            <Layout className="text-blue-500" />
            INTERFACE CONFIG
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Reorder and toggle dashboard modules</p>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div 
                key={section.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all",
                  section.enabled ? "bg-slate-900 border-slate-800" : "bg-slate-950 border-slate-900 opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 text-slate-600 hover:text-white"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 text-slate-600 hover:text-white"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                    >
                      <ChevronDown size={14} />
                    </Button>
                  </div>
                  <span className="text-sm font-bold uppercase tracking-tight">{section.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {section.enabled ? <Eye size={14} className="text-blue-500" /> : <EyeOff size={14} className="text-slate-600" />}
                  <Switch 
                    checked={section.enabled} 
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LayoutSettings;