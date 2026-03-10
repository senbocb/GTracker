"use client";

import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: string;
  tier?: string;
  gameTitle?: string;
  className?: string;
}

const RankBadge = ({ rank, tier, gameTitle = "", className }: RankBadgeProps) => {
  const [imgError, setImgError] = useState(false);

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

  const getIconUrl = (game: string, rankName: string, tierName?: string) => {
    const g = game.toLowerCase();
    const r = rankName.toLowerCase();
    const t = tierName?.toLowerCase() || "";
    
    // Valorant
    if (g.includes('valorant')) {
      const tierNum = t.replace(/\D/g, '') || '1';
      return `https://trackercdn.com/cdn/valorant/ranks/${r}_${tierNum}.png`;
    }
    
    // League of Legends
    if (g.includes('league')) {
      return `https://trackercdn.com/cdn/league/ranks/${r}.png`;
    }

    // Apex Legends
    if (g.includes('apex')) {
      return `https://trackercdn.com/cdn/apex/ranks/${r}.png`;
    }

    // Overwatch
    if (g.includes('overwatch')) {
      return `https://trackercdn.com/cdn/overwatch/ranks/${r}.png`;
    }

    // CS2 Faceit
    if (r.includes('level')) {
      const lvl = r.replace(/\D/g, '');
      return `https://trackercdn.com/cdn/faceit/levels/level${lvl}.png`;
    }

    return null;
  };

  const iconUrl = getIconUrl(gameTitle, rank, tier);
  const colorClasses = getRankColor(rank);

  return (
    <div className={cn(
      "flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105",
      colorClasses,
      className
    )}>
      {iconUrl && !imgError ? (
        <img 
          src={iconUrl} 
          alt={rank} 
          className="w-5 h-5 object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <Trophy size={12} />
      )}
      <span>{rank} {tier}</span>
    </div>
  );
};

export default RankBadge;