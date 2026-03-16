"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Globe, Zap, Shield, Wrench, Mouse, Keyboard, Headphones, Mic, Monitor, Cpu, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface Peripheral {
  id: string;
  type: 'mouse' | 'keyboard' | 'headset' | 'mic' | 'monitor' | 'pc' | 'other';
  name: string;
}

interface ProfileEquipmentProps {
  isEditing: boolean;
  data: any;
  onChange: (data: any) => void;
}

const PERIPHERAL_ICONS = {
  mouse: <Mouse size={16} />,
  keyboard: <Keyboard size={16} />,
  headset: <Headphones size={16} />,
  mic: <Mic size={16} />,
  monitor: <Monitor size={16} />,
  pc: <Cpu size={16} />,
  other: <Wrench size={16} />
};

const ProfileEquipment = ({ isEditing, data, onChange }: ProfileEquipmentProps) => {
  const peripherals: Peripheral[] = data.peripherals || [];

  const addPeripheral = () => {
    const updated = [...peripherals, { id: Date.now().toString(), type: 'other', name: 'New Gear' }];
    onChange({ ...data, peripherals: updated });
  };

  const removePeripheral = (id: string) => {
    const updated = peripherals.filter(p => p.id !== id);
    onChange({ ...data, peripherals: updated });
  };

  const updatePeripheral = (id: string, field: keyof Peripheral, value: string) => {
    const updated = peripherals.map(p => p.id === id ? { ...p, [field]: value } : p);
    onChange({ ...data, peripherals: updated });
  };

  // Auto-detect type based on name
  const detectType = (name: string): Peripheral['type'] => {
    const n = name.toLowerCase();
    if (n.includes('mouse') || n.includes('gpro') || n.includes('viper')) return 'mouse';
    if (n.includes('keyboard') || n.includes('apex') || n.includes('huntsman')) return 'keyboard';
    if (n.includes('headset') || n.includes('cloud') || n.includes('arctis')) return 'headset';
    if (n.includes('mic') || n.includes('yeti') || n.includes('shure')) return 'mic';
    if (n.includes('monitor') || n.includes('benq') || n.includes('zowie')) return 'monitor';
    if (n.includes('pc') || n.includes('rtx') || n.includes('intel')) return 'pc';
    return 'other';
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-2 border-b border-slate-800/50 flex flex-row items-center justify-between">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
          <Wrench size={14} />
          Tactical Equipment
        </CardTitle>
        {isEditing && (
          <Button variant="ghost" size="icon" className="h-6 w-6 text-indigo-400" onClick={addPeripheral}>
            <Plus size={14} />
          </Button>
        )}
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
        </div>

        <div className="pt-4 border-t border-slate-800/50 space-y-3">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Peripherals</p>
          {peripherals.map((p) => (
            <div key={p.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-slate-400">
                {PERIPHERAL_ICONS[p.type] || <Wrench size={16} />}
                {isEditing ? (
                  <Input 
                    value={p.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      updatePeripheral(p.id, 'name', name);
                      updatePeripheral(p.id, 'type', detectType(name));
                    }}
                    className="bg-slate-950 border-slate-800 h-7 w-32 text-[10px] font-bold uppercase"
                  />
                ) : (
                  <span className="text-[10px] font-black uppercase text-white truncate max-w-[120px]">{p.name}</span>
                )}
              </div>
              {isEditing && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-600 hover:text-red-400" onClick={() => removePeripheral(p.id)}>
                  <Trash2 size={12} />
                </Button>
              )}
            </div>
          ))}
          {peripherals.length === 0 && !isEditing && (
            <p className="text-[9px] text-slate-600 italic">No peripherals listed.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEquipment;