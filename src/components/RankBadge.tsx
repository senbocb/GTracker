"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: string;
  tier?: string;
  gameTitle?: string;
  className?: string;
}

const RankBadge = ({ rank, tier, gameTitle = "", className }: RankBadgeProps) => {
  const getRankStyle = () => {
    const r = rank?.toLowerCase() || "";
    const t = tier?.toLowerCase() || "";
    const g = gameTitle?.toLowerCase() || "";
    const rankNum = parseInt(rank) || 0;

    // 1. Peak Ranks (Elite Status)
    const isPeak = 
      (g.includes('valorant') && r === 'radiant') ||
      (g.includes('overwatch') && r === 'top 500') ||
      (g.includes('league') && r === 'challenger') ||
      (g.includes('apex') && r === 'apex predator') ||
      (g.includes('counter-strike') && (t.includes('level 10') || r.includes('global elite'))) ||
      (g.includes('counter-strike') && rankNum >= 30000) ||
      (g.includes('osu!') && rankNum > 0 && rankNum <= 100) ||
      (g.includes('the finals') && r === 'ruby') ||
      (g.includes('marvel rivals') && r === 'eternity');

    if (isPeak) return 'rainbow-gradient border-none shadow-[0_0_15px_rgba(99,102,241,0.4)]';

    // 2. CS2 Premier ELO Logic
    if (g.includes('counter-strike') && !isNaN(rankNum) && !t.includes('level')) {
      if (rankNum >= 25000) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
      if (rankNum >= 20000) return 'bg-red-500/20 border-red-500/40 text-red-400';
      if (rankNum >= 15000) return 'bg-pink-500/20 border-pink-500/40 text-pink-400';
      if (rankNum >= 10000) return 'bg-purple-500/20 border-purple-500/40 text-purple-400';
      if (rankNum >= 5000) return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
      return 'bg-slate-400/20 border-slate-400/40 text-slate-300';
    }

    // 3. Faceit Level Logic
    if (t.includes('level')) {
      const lvl = parseInt(t.replace(/\D/g, ''));
      if (lvl >= 10) return 'bg-red-600/20 border-red-600/40 text-red-500';
      if (lvl >= 8) return 'bg-red-500/20 border-red-500/40 text-red-400';
      if (lvl >= 4) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
      return 'bg-slate-400/20 border-slate-400/40 text-slate-300';
    }

    // 4. Standard Tier Logic (Valorant, LoL, Apex, etc.)
    if (r.includes('iron') || r.includes('rookie') || r.includes('copper')) 
      return 'bg-zinc-500/20 border-zinc-500/40 text-zinc-400';
    
    if (r.includes('bronze')) 
      return 'bg-orange-800/20 border-orange-800/40 text-orange-700';
    
    if (r.includes('silver')) 
      return 'bg-slate-300/20 border-slate-300/40 text-slate-200';
    
    if (r.includes('gold')) 
      return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
    
    if (r.includes('platinum')) 
      return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400';
    
    if (r.includes('diamond')) 
      return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
    
    if (r.includes('ascendant') || r.includes('emerald')) 
      return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
    
    if (r.includes('immortal') || r.includes('master') || r.includes('grandmaster')) 
      return 'bg-purple-600/20 border-purple-600/40 text-purple-400';

    if (g.includes('osu!')) 
      return 'bg-pink-500/20 border-pink-500/40 text-pink-400';

    return 'bg-slate-800/50 border-slate-700 text-slate-400';
  };

  const isFaceit = tier?.toLowerCase().includes('level');
  const isOsu = gameTitle?.toLowerCase().includes('osu!');
  
  let displayLabel = isFaceit ? `${tier} (${rank})` : `${rank} ${tier || ''}`.trim();
  if (isOsu && rank && rank !== 'Unranked') {
    displayLabel = `#${Number(rank).toLocaleString()}`;
  }

  return (
    <div className={cn(
      "flex items-center justify-center px-3 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 min-w-[60px]",
      getRankStyle(),
      className
    )}>
      <span>{displayLabel}</span>
    </div>
  );
};

export default RankBadge;