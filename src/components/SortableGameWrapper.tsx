"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SortableGameWrapperProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const SortableGameWrapper = ({ id, children, disabled }: SortableGameWrapperProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "relative touch-none transition-shadow",
        isDragging && "opacity-50 scale-[1.02] shadow-2xl z-50"
      )}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

export default SortableGameWrapper;