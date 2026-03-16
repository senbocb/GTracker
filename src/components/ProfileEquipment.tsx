"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Globe, Zap, Shield, Wrench } from 'lucide-react';

interface ProfileEquipmentProps {
  isEditing: boolean;
  data: any;
  onChange: (data: any) => void;
}

const ProfileEquipment = ({ isEditing, data, onChange }: ProfileEquipmentProps) => {
  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-2 border-b border-slate-800/50">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
          <Wrench size={14} />
          Tactical Equipment
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-400">
              <Gamepad2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Main Game</span>
            </div>
            {isEditing ? (
              <Input 
                value={data.main_game || ''}
                onChange={(e) => onChange({...data, main_game: e.target.value})}
                className="bg-slate-950 border-slate-800 h-8 w-32 text-[10px] font-bold uppercase"
              />
            ) : (
              <span className="text-[10px] font-black uppercase text-white">{data.main_game || 'N/A'}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-400">
              <Globe size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Region</span>
            </div>
            {isEditing ? (
              <Input 
                value={data.region || ''}
                onChange={(e) => onChange({...data, region: e.target.value})}
                className="bg-slate-950 border-slate-800 h-8 w-32 text-[10px] font-bold uppercase"
              />
            ) : (
              <span className="text-[10px] font-black uppercase text-white">{data.region || 'Global'}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-400">
              <Zap size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Sensitivity</span>
            </div>
            {isEditing ? (
              <Input 
                value={data.sensitivity || ''}
                onChange={(e) => onChange({...data, sensitivity: e.target.value})}
                className="bg-slate-950 border-slate-800 h-8 w-32 text-[10px] font-bold uppercase"
              />
            ) : (
              <span className="text-[10px] font-black uppercase text-white">{data.sensitivity || 'N/A'}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-400">
              <Shield size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Primary Unit</span>
            </div>
            <span className="text-[10px] font-black uppercase text-indigo-400">SQUAD_ALPHA</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEquipment;