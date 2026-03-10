"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { User, Shield, Target, Zap, Award, ChevronLeft, Camera, Edit2, Check, X, Plus, ExternalLink, Settings2, Globe, Medal, Star, Trophy, Gamepad2 } from 'lucide-react'; // Added Gamepad2 import
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { showSuccess } from '@/utils/toast';

interface CareerStat {
  id: string;
  label: string;
  gameId?: string;
  statType: 'peak' | 'current' | 'winrate' | 'hours' | 'account_age' | 'total_xp';
  category: 'account' | 'game';
}

const Profile = () => {
  // ... (rest of the component remains unchanged)
};

export default Profile;