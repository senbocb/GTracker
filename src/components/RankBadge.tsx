"use client";

import React from 'react';
import { Trophy, Star, Shield, Medal } from 'lucide-react';
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: string;
  tier?: string;
  className?: string;
}

const RankBadge = ({ rank, tier, className }: RankBadgeProps) => {
  const getRankColor = (rankName: string) => {
    const r = rankName.toLowerCase();
    if (r.includes('iron') || r.includes('bronze')) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    if (r.includes('silver')) return 'text-slate-300 bg-slate-300/10 border-slate-300/20';
    if (r.includes('gold')) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    if (r.includes('platinum')) return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    if (r.includes('diamond')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (r.includes('ascendant') || r.includes('emerald')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (r.includes('immortal') || r.includes('master')) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    if (r.includes('radiant') || r.includes('challenger') || r.includes('global')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const colorClasses = getRankColor(rank);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold uppercase tracking-wider",
      colorClasses,
      className
    )}>
      <Trophy size={14} />
      <span>{rank} {tier}</span>
    </div>
  );
};

export default RankBadge;