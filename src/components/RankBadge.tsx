"use client";

import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: string;
  tier?: string;
  gameTitle?: string;
  className?: string;
}

const RankBadge = ({ rank, tier, gameTitle = "", className }: RankBadgeProps) => {
  const registryInfo = useMemo(() => {
    const registry = JSON.parse(localStorage.getItem('combat_game_registry') || '{}');
    const gameData = Object.values(registry).find((g: any) => g.title === gameTitle) as any;
    
    if (!gameData) return null;

    const rankData = gameData.rank_configs?.[rank];
    const isTopRank = gameData.ranks?.[gameData.ranks.length - 1] === rank;
    const useRainbow = gameData.enable_rainbow !== false && isTopRank;

    return {
      iconUrl: rankData?.icon_url,
      isRainbow: useRainbow
    };
  }, [rank, gameTitle]);

  const getRankStyle = () => {
    if (registryInfo?.isRainbow) return 'rainbow-gradient border-none shadow-[0_0_15px_rgba(99,102,241,0.4)]';

    const r = rank?.toLowerCase() || "";
    const t = tier?.toLowerCase() || "";
    const g = gameTitle?.toLowerCase() || "";
    const rankNum = parseInt(rank) || 0;

    // Fallback styles if no icon is present
    if (!registryInfo?.iconUrl) {
      // Elite Status
      const isPeak = 
        (g.includes('valorant') && r === 'radiant') ||
        (g.includes('overwatch') && r === 'top 500') ||
        (g.includes('league') && r === 'challenger') ||
        (g.includes('apex') && r === 'apex predator') ||
        (g.includes('counter-strike') && (t.includes('level 10') || r.includes('global elite'))) ||
        (g.includes('counter-strike') && rankNum >= 30000);

      if (isPeak) return 'rainbow-gradient border-none shadow-[0_0_15px_rgba(99,102,241,0.4)]';

      // Standard Tiers
      if (r.includes('iron') || r.includes('rookie') || r.includes('copper')) return 'bg-zinc-500/20 border-zinc-500/40 text-zinc-400';
      if (r.includes('bronze')) return 'bg-orange-800/20 border-orange-800/40 text-orange-700';
      if (r.includes('silver')) return 'bg-slate-300/20 border-slate-300/40 text-slate-200';
      if (r.includes('gold')) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
      if (r.includes('platinum')) return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400';
      if (r.includes('diamond')) return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
      if (r.includes('ascendant') || r.includes('emerald')) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
      if (r.includes('immortal') || r.includes('master') || r.includes('grandmaster')) return 'bg-purple-600/20 border-purple-600/40 text-purple-400';
    }

    return 'bg-slate-800/50 border-slate-700 text-slate-400';
  };

  let displayLabel = `${rank} ${tier || ''}`.trim();
  if (gameTitle?.toLowerCase().includes('osu!') && rank && rank !== 'Unranked') {
    displayLabel = `#${Number(rank).toLocaleString()}`;
  }

  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-2 px-3 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 min-w-[60px]",
        getRankStyle(),
        className
      )}
    >
      {registryInfo?.iconUrl && (
        <img src={registryInfo.iconUrl} alt="" className="w-6 h-6 object-contain" />
      )}
      <span>{displayLabel}</span>
    </div>
  );
};

export default RankBadge;