"use client";

import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: string;
  tier?: string;
  gameTitle?: string;
  className?: string;
}

const CS2_RANK_ICONS: Record<string, string> = {
  "Silver I": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/1.png",
  "Silver II": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/2.png",
  "Silver III": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/3.png",
  "Silver IV": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/4.png",
  "Silver Elite": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/5.png",
  "Silver Elite Master": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/6.png",
  "Gold Nova I": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/7.png",
  "Gold Nova II": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/8.png",
  "Gold Nova III": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/9.png",
  "Gold Nova Master": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/10.png",
  "Master Guardian I": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/11.png",
  "Master Guardian II": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/12.png",
  "Master Guardian Elite": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/13.png",
  "Distinguished Master Guardian": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/14.png",
  "Legendary Eagle": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/15.png",
  "Legendary Eagle Master": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/16.png",
  "Supreme Master First Class": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/17.png",
  "The Global Elite": "https://raw.githubusercontent.com/p0melo/csgo-ranks-icons/master/18.png"
};

const RankBadge = ({ rank, tier, gameTitle = "", className }: RankBadgeProps) => {
  const customStyle = useMemo(() => {
    const registry = JSON.parse(localStorage.getItem('combat_game_registry') || '{}');
    const gameData = Object.values(registry).find((g: any) => g.title === gameTitle) as any;
    
    if (!gameData) return null;

    const rankData = gameData.rank_configs?.[rank];
    if (!rankData) return null;

    const isTopRank = gameData.ranks?.[gameData.ranks.length - 1] === rank;
    const useRainbow = gameData.enable_rainbow !== false && isTopRank;

    if (useRainbow) return { isRainbow: true };

    return {
      backgroundColor: `${rankData.color}20`,
      borderColor: `${rankData.color}40`,
      color: rankData.color
    };
  }, [rank, gameTitle]);

  const getRankStyle = () => {
    if (customStyle) {
      if (customStyle.isRainbow) return 'rainbow-gradient border-none shadow-[0_0_15px_rgba(99,102,241,0.4)]';
      return ""; 
    }

    const r = rank?.toLowerCase() || "";
    const t = tier?.toLowerCase() || "";
    const g = gameTitle?.toLowerCase() || "";
    const rankNum = parseInt(rank) || 0;

    // Elite Status
    const isPeak = 
      (g.includes('valorant') && r === 'radiant') ||
      (g.includes('overwatch') && r === 'top 500') ||
      (g.includes('league') && r === 'challenger') ||
      (g.includes('apex') && r === 'apex predator') ||
      (g.includes('counter-strike') && (t.includes('level 10') || r.includes('global elite'))) ||
      (g.includes('counter-strike') && rankNum >= 30000) ||
      (g.includes('the finals') && r === 'ruby') ||
      (g.includes('marvel rivals') && r === 'eternity');

    if (isPeak) return 'rainbow-gradient border-none shadow-[0_0_15px_rgba(99,102,241,0.4)]';

    // CS2 Premier ELO
    if (g.includes('counter-strike') && !isNaN(rankNum) && !t.includes('level') && !r.includes('silver')) {
      if (rankNum >= 25000) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
      if (rankNum >= 20000) return 'bg-red-500/20 border-red-500/40 text-red-400';
      if (rankNum >= 15000) return 'bg-pink-500/20 border-pink-500/40 text-pink-400';
      if (rankNum >= 10000) return 'bg-purple-500/20 border-purple-500/40 text-purple-400';
      if (rankNum >= 5000) return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
      return 'bg-slate-400/20 border-slate-400/40 text-slate-300';
    }

    // Standard Tiers
    if (r.includes('iron') || r.includes('rookie') || r.includes('copper')) return 'bg-zinc-500/20 border-zinc-500/40 text-zinc-400';
    if (r.includes('bronze')) return 'bg-orange-800/20 border-orange-800/40 text-orange-700';
    if (r.includes('silver')) return 'bg-slate-300/20 border-slate-300/40 text-slate-200';
    if (r.includes('gold')) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
    if (r.includes('platinum')) return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400';
    if (r.includes('diamond')) return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
    if (r.includes('ascendant') || r.includes('emerald')) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
    if (r.includes('immortal') || r.includes('master') || r.includes('grandmaster')) return 'bg-purple-600/20 border-purple-600/40 text-purple-400';

    return 'bg-slate-800/50 border-slate-700 text-slate-400';
  };

  const isOsu = gameTitle?.toLowerCase().includes('osu!');
  let displayLabel = `${rank} ${tier || ''}`.trim();
  if (isOsu && rank && rank !== 'Unranked') {
    displayLabel = `#${Number(rank).toLocaleString()}`;
  }

  const cs2Icon = gameTitle?.toLowerCase().includes('counter-strike') ? CS2_RANK_ICONS[rank] : null;

  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-2 px-3 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 min-w-[60px]",
        getRankStyle(),
        className
      )}
      style={customStyle && !customStyle.isRainbow ? {
        backgroundColor: customStyle.backgroundColor,
        borderColor: customStyle.borderColor,
        color: customStyle.color
      } : {}}
    >
      {cs2Icon && <img src={cs2Icon} alt="" className="w-6 h-4 object-contain" />}
      <span>{displayLabel}</span>
    </div>
  );
};

export default RankBadge;