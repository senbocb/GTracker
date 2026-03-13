"use client";

import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Check } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      showSuccess("Password updated successfully.");
      navigate('/login');
    } catch (err: any) {
      showError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
        <div className="h-2 w-full bg-indigo-600" />
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-indigo-500" size={32} />
          </div>
          <CardTitle className="text-2xl font-black italic uppercase tracking-tight text-white">
            Update Password
          </CardTitle>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secure Credential Update</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">New Password</Label>
              <Input 
                required
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Confirm Password</Label>
              <Input 
                required
                type="password"
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <Button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-7 rounded-2xl">
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;