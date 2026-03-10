"use client";

import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, Settings as SettingsIcon, Bell, Shield, Eye, Monitor, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
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

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="text-blue-500" size={20} />
                PRIVACY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-white">Public Profile</Label>
                  <p className="text-sm text-slate-500">Allow others to view your career stats.</p>
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