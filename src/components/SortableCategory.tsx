"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableSocialItem from './SortableSocialItem';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableCategoryProps {
  category: any;
  items: any[];
  onRemoveSocial: (id: string) => void;
  onAddClick?: () => void;
  showAddButton?: boolean;
}

const SortableCategory = ({ category, items, onRemoveSocial, onAddClick, showAddButton }: SortableCategoryProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "space-y-1.5 touch-none",
        isDragging && "opacity-50"
      )}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 cursor-grab active:cursor-grabbing hover:text-slate-300 transition-colors"
      >
        {category.icon}
        {category.label}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <SortableContext items={items.map(i => i.id)} strategy={horizontalListSortingStrategy}>
          {items.map((social) => (
            <SortableSocialItem 
              key={social.id} 
              social={social} 
              onRemove={onRemoveSocial} 
            />
          ))}
        </SortableContext>
        
        {showAddButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onAddClick}
            className="h-7 w-7 rounded-lg bg-slate-900/50 border border-dashed border-slate-800 text-slate-500 hover:text-white hover:border-indigo-500"
          >
            <Plus size={14} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SortableCategory;