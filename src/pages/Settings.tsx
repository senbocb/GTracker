"use client";

import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, Settings as SettingsIcon, Bell, Shield, Monitor, Target, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess } from '@/utils/toast';

const Settings = () => {
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Season goal updated.");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-3xl mx-auto p-6 md:p-10">
        <Link to="/">
          <Button variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4">
            <ChevronLeft className="mr-2" size={20} />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">SYSTEM CONFIGURATION</h1>
          <p className="text-slate-400 font-medium">Adjust your interface and tracking parameters.</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Target className="text-blue-500" size={20} />
                SEASON GOAL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGoal} className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Target Rank</Label>
                  <div className="relative">
                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input placeholder="e.g. Immortal" className="bg-slate-950 border-slate-800 pl-10" />
                  </div>
                </div>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-500">
                  Update Goal
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Monitor className="text-blue-500" size={20} />
                INTERFACE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-white">High Contrast Mode</Label>
                  <p className="text-sm text-slate-500">Enhance visibility for competitive environments.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-white">Compact Dashboard</Label>
                  <p className="text-sm text-slate-500">Show more data in less space.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Bell className="text-blue-500" size={20} />
                NOTIFICATIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-white">Rank Change Alerts</Label>
                  <p className="text-sm text-slate-500">Notify when you promote or demote.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-white">Session Reminders</Label>
                  <p className="text-sm text-slate-500">Alert after 3 hours of continuous play.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
};

export default Settings;