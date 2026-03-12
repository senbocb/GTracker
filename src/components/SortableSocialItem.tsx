"use client";

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Globe, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { syncTrackerData } from '@/utils/statSync';

interface SortableSocialItemProps {
  social: any;
  onRemove: (id: string) => void;
}

const SortableSocialItem = ({ social, onRemove }: SortableSocialItemProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: social.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const handleSync = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!social.gameId) return;
    
    setIsSyncing(true);
    await syncTrackerData(social.gameId, social.url);
    setIsSyncing(false);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "group relative touch-none",
        isDragging && "opacity-50 scale-105"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all backdrop-blur-sm cursor-grab active:cursor-grabbing"
      >
        {social.icon ? (
          <img src={social.icon} alt={social.name} className="w-3.5 h-3.5 object-contain rounded-sm" />
        ) : (
          <Globe size={12} className="text-slate-400" />
        )}
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{social.name}</span>
        
        {social.category === 'stat_trackers' && social.gameId && (
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={cn(
              "ml-1 p-0.5 rounded hover:bg-indigo-500/20 text-indigo-400 transition-colors",
              isSyncing && "animate-spin"
            )}
          >
            <RefreshCw size={10} />
          </button>
        )}
      </div>
      <button 
        onClick={() => onRemove(social.id)}
        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
      >
        <X size={8} />
      </button>
    </div>
  );
};

export default SortableSocialItem;