"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Image as ImageIcon, Plus, Trash2, Maximize2, X, Calendar, Info, Edit2, Clock } from 'lucide-react';
import { processImage } from '@/utils/imageProcessing';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface GalleryImage {
  id: string;
  url: string;
  timestamp: string;
  description: string;
}

const ProfileGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('combat_gallery_v2') || '[]');
    if (saved.length === 0) {
      // Migration from old format if exists
      const oldSaved = JSON.parse(localStorage.getItem('combat_gallery') || '[]');
      if (oldSaved.length > 0) {
        const migrated = oldSaved.map((url: string, i: number) => ({
          id: `migrated-${i}-${Date.now()}`,
          url,
          timestamp: new Date().toISOString(),
          description: 'Archived capture'
        }));
        setImages(migrated);
        localStorage.setItem('combat_gallery_v2', JSON.stringify(migrated));
      }
    } else {
      setImages(saved);
    }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = [...images];
    for (let i = 0; i < files.length; i++) {
      try {
        const processed = await processImage(files[i], 1200, 800, 0.7);
        newImages.unshift({
          id: Date.now().toString() + i,
          url: processed,
          timestamp: new Date().toISOString(),
          description: ''
        });
      } catch (err) {
        showError("Failed to process one or more images.");
      }
    }

    setImages(newImages);
    localStorage.setItem('combat_gallery_v2', JSON.stringify(newImages));
    showSuccess(`${files.length} capture(s) added to gallery.`);
  };

  const removeImage = (id: string) => {
    const newImages = images.filter((img) => img.id !== id);
    setImages(newImages);
    localStorage.setItem('combat_gallery_v2', JSON.stringify(newImages));
    showSuccess("Capture removed.");
  };

  const updateImageMetadata = () => {
    if (!editingImage) return;
    const newImages = images.map(img => img.id === editingImage.id ? editingImage : img);
    setImages(newImages);
    localStorage.setItem('combat_gallery_v2', JSON.stringify(newImages));
    setEditingImage(null);
    showSuccess("Intel updated.");
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="text-indigo-500" size={20} /> 
          SCREENSHOTS & GALLERY
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
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <img src={img.url} alt="Capture" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              
              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] font-black text-white uppercase tracking-tighter truncate">
                  {img.description || 'No description'}
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={8} /> {new Date(img.timestamp).toLocaleDateString()}
                </p>
              </div>

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
                  className="h-10 w-10 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400"
                  onClick={() => setEditingImage(img)}
                >
                  <Edit2 size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400"
                  onClick={() => removeImage(img.id)}
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

      {/* Edit Metadata Dialog */}
      <Dialog open={!!editingImage} onOpenChange={(v) => !v && setEditingImage(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="italic uppercase font-black">EDIT CAPTURE INTEL</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <div className="space-y-6 py-4">
              <div className="aspect-video rounded-xl overflow-hidden border border-slate-800">
                <img src={editingImage.url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Timestamp</Label>
                  <Input 
                    type="datetime-local" 
                    value={new Date(editingImage.timestamp).toISOString().slice(0, 16)} 
                    onChange={(e) => setEditingImage({...editingImage, timestamp: new Date(e.target.value).toISOString()})}
                    className="bg-slate-900 border-slate-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Description / Bio</Label>
                  <Textarea 
                    placeholder="Describe this tactical moment..." 
                    value={editingImage.description}
                    onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
                    className="bg-slate-900 border-slate-800 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={updateImageMetadata} className="w-full bg-indigo-600 font-black uppercase py-6">SAVE INTEL</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full View Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-8 right-8 text-white hover:bg-white/10 rounded-full h-12 w-12"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </Button>
          
          <div className="max-w-5xl w-full space-y-6">
            <img src={selectedImage.url} alt="Full view" className="w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-slate-800" />
            
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Calendar size={12} /> {new Date(selectedImage.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="text-lg font-bold text-white italic">
                {selectedImage.description || 'No description provided for this capture.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileGallery;