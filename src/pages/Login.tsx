"use client";

import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Mail, UserPlus, LogIn, Key } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    pin: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.pin.length < 4 || formData.pin.length > 10) {
      showError("PIN must be 4-10 digits.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign up with username in metadata so the trigger can pick it up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              pin: formData.pin,
              username: formData.username
            }
          }
        });
        
        if (error) throw error;

        if (data.session) {
          showSuccess("Account initialized. Welcome, Operator.");
          navigate('/');
        } else {
          showSuccess("Registration successful. Please check your email for verification.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        
        if (error) throw error;

        // Verify PIN from metadata
        const userPin = data.user?.user_metadata?.pin;
        if (userPin !== formData.pin) {
          await supabase.auth.signOut();
          throw new Error("Security PIN mismatch. Access Denied.");
        }
        
        showSuccess("Authorization confirmed. Welcome back.");
        navigate('/');
      }
    } catch (err: any) {
      showError(err.message || "Authentication failed.");
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
            <Shield className="text-indigo-500" size={32} />
          </div>
          <CardTitle className="text-2xl font-black italic uppercase tracking-tight text-white">
            {isSignUp ? 'Initialize Account' : 'Operator Login'}
          </CardTitle>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secure Access Protocol</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <Input 
                  required
                  type="email"
                  placeholder="name@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-slate-950 border-slate-800 pl-10 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <Input 
                  required
                  type="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="bg-slate-950 border-slate-800 pl-10 text-white"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">Username</Label>
                <Input 
                  required
                  placeholder="OPERATOR_NAME" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-indigo-400">Security PIN (4-10 Digits)</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                <Input 
                  required
                  type="password"
                  inputMode="numeric"
                  placeholder="0000" 
                  value={formData.pin}
                  onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                  className="bg-slate-950 border-slate-800 pl-10 text-center text-xl font-black tracking-[0.5em] text-white"
                />
              </div>
            </div>

            <Button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-7 rounded-2xl shadow-xl shadow-indigo-600/20">
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Authorize Access'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] font-black uppercase text-slate-500 hover:text-indigo-400 transition-colors"
            >
              {isSignUp ? 'Already have an account? Login' : 'New Operator? Create Account'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;