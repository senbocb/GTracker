"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Plus, Trash2, Maximize2, X } from 'lucide-react';
import { processImage } from '@/utils/imageProcessing';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const ProfileGallery = () => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_gallery') || '[]');
    setImages(saved);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = [...images];
    for (let i = 0; i < files.length; i++) {
      try {
        const processed = await processImage(files[i], 1200, 800, 0.7);
        newImages.push(processed);
      } catch (err) {
        showError("Failed to process one or more images.");
      }
    }

    setImages(newImages);
    localStorage.setItem('combat_gallery', JSON.stringify(newImages));
    showSuccess(`${files.length} capture(s) added to gallery.`);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    localStorage.setItem('combat_gallery', JSON.stringify(newImages));
    showSuccess("Capture removed.");
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="text-indigo-500" size={20} /> 
          COMBAT GALLERY
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-slate-800 bg-slate-900/50 text-[10px] font-bold uppercase tracking-widest"
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus size={14} className="mr-1" /> Upload Captures
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="image/*" 
          onChange={handleUpload} 
        />
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <img src={img} alt={`Capture ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => setSelectedImage(img)}
                >
                  <Maximize2 size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400"
                  onClick={() => removeImage(idx)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 cursor-pointer hover:bg-slate-900/40 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-4 text-slate-600">
            <ImageIcon size={24} />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No mission captures archived</p>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-8 right-8 text-white hover:bg-white/10 rounded-full h-12 w-12"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </Button>
          <img src={selectedImage} alt="Full view" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </section>
  );
};

export default ProfileGallery;