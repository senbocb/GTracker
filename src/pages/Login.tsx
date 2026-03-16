"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, Mail, Key, RefreshCw, ArrowLeft } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/components/AuthProvider";
import { cn } from '@/lib/utils';

type AuthView = 'login' | 'signup' | 'forgot-password';

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    pin: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'signup') {
        if (formData.pin.length < 4) throw new Error("PIN must be at least 4 digits.");
        
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              pin: formData.pin,
              username: formData.username || formData.email.split('@')[0]
            },
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            showError("Account already exists. Redirecting to Login...");
            setView('login');
            return;
          }
          throw error;
        }

        if (data.session) {
          showSuccess("Account initialized. Welcome, Operator.");
          navigate('/');
        } else {
          showSuccess("Verification email sent. Please check your inbox.");
        }
      } else if (view === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            showError("Email not verified. Please check your inbox.");
            return;
          }
          throw error;
        }

        const userPin = data.user?.user_metadata?.pin;
        if (userPin && userPin !== formData.pin) {
          await supabase.auth.signOut();
          throw new Error("Security PIN mismatch. Access Denied.");
        }
        
        showSuccess("Authorization confirmed.");
        navigate('/');
      } else if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        showSuccess("Password reset link sent to your email.");
        setView('login');
      }
    } catch (err: any) {
      showError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!formData.email) {
      showError("Please enter your email first.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });
      if (error) throw error;
      showSuccess("Verification email resent.");
    } catch (err: any) {
      showError(err.message || "Failed to resend email.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
        <div className="h-2 w-full bg-indigo-600" />
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="text-indigo-500" size={32} />
          </div>
          <CardTitle className="text-2xl font-black italic uppercase tracking-tight text-white">
            {view === 'signup' ? 'Initialize Account' : view === 'forgot-password' ? 'Reset Access' : 'Operator Login'}
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

            {view !== 'forgot-password' && (
              <>
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

                {view === 'signup' && (
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
                  <Label className="text-[10px] font-black uppercase text-indigo-400">Security PIN</Label>
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe} 
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                      className="border-slate-700 data-[state=checked]:bg-indigo-600"
                    />
                    <label htmlFor="remember" className="text-[10px] font-bold uppercase text-slate-500 cursor-pointer">Remember Me</label>
                  </div>
                  {view === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-[10px] font-bold uppercase text-indigo-400 hover:text-indigo-300"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
              </>
            )}

            <Button 
              disabled={loading} 
              className="w-full bg-indigo-600 hover:bg-indigo-500 font-black uppercase py-7 rounded-2xl shadow-xl shadow-indigo-600/20"
            >
              {loading ? 'Processing...' : view === 'signup' ? 'Create Account' : view === 'forgot-password' ? 'Send Reset Link' : 'Authorize Access'}
            </Button>
          </form>

          <div className="mt-8 flex flex-col gap-4 text-center">
            {view === 'forgot-password' ? (
              <button 
                onClick={() => setView('login')}
                className="text-[10px] font-black uppercase text-slate-500 hover:text-white flex items-center justify-center gap-2"
              >
                <ArrowLeft size={12} /> Back to Login
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                  className="text-[10px] font-black uppercase text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  {view === 'login' ? 'New Operator? Create Account' : 'Already have an account? Login'}
                </button>
                {view === 'login' && (
                  <button 
                    onClick={resendVerification}
                    className="text-[10px] font-black uppercase flex items-center justify-center gap-2 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <RefreshCw size={12} />
                    Resend Verification Email
                  </button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;