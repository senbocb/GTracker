"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, Plus, Trash2, Maximize2, X, Calendar, Edit2, Clock, ListMusic, FolderPlus, ArrowUpDown } from 'lucide-react';
import { processImage } from '@/utils/imageProcessing';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface Playlist {
  id: string;
  name: string;
  description: string;
}

interface GalleryImage {
  id: string;
  url: string;
  timestamp: string;
  description: string;
  playlistId?: string;
}

const ProfileGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isNewPlaylistOpen, setIsNewPlaylistOpen] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('combat_gallery_v3') || '[]');
    const savedPlaylists = JSON.parse(localStorage.getItem('combat_playlists') || '[]');
    setImages(savedImages);
    setPlaylists(savedPlaylists);
  }, []);

  const saveAll = (newImages: GalleryImage[], newPlaylists: Playlist[]) => {
    setImages(newImages);
    setPlaylists(newPlaylists);
    localStorage.setItem('combat_gallery_v3', JSON.stringify(newImages));
    localStorage.setItem('combat_playlists', JSON.stringify(newPlaylists));
  };

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
          description: '',
          playlistId: activePlaylistId === 'all' ? undefined : activePlaylistId
        });
      } catch (err) {
        showError("Failed to process one or more images.");
      }
    }
    saveAll(newImages, playlists);
    showSuccess(`${files.length} capture(s) added.`);
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylist.name) return;
    const playlist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylist.name,
      description: newPlaylist.description
    };
    saveAll(images, [...playlists, playlist]);
    setNewPlaylist({ name: '', description: '' });
    setIsNewPlaylistOpen(false);
    showSuccess(`Playlist "${playlist.name}" created.`);
  };

  const removeImage = (id: string) => {
    saveAll(images.filter(img => img.id !== id), playlists);
    showSuccess("Capture removed.");
  };

  const filteredAndSortedImages = useMemo(() => {
    let result = activePlaylistId === 'all' 
      ? images 
      : images.filter(img => img.playlistId === activePlaylistId);
    
    return result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [images, activePlaylistId, sortOrder]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="text-indigo-500" size={20} /> 
          SCREENSHOTS & GALLERY
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-slate-800 bg-slate-900/50 text-[10px] font-bold uppercase tracking-widest"
            onClick={() => setIsNewPlaylistOpen(true)}
          >
            <FolderPlus size={14} className="mr-1" /> New Playlist
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-slate-800 bg-slate-900/50 text-[10px] font-bold uppercase tracking-widest"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={14} className="mr-1" /> Upload
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleUpload} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Playlists Sidebar */}
        <div className="w-full md:w-48 shrink-0 space-y-2">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Playlists</p>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-[10px] font-bold uppercase tracking-widest h-9",
              activePlaylistId === 'all' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            )}
            onClick={() => setActivePlaylistId('all')}
          >
            <ListMusic size={14} className="mr-2" /> All Captures
          </Button>
          {playlists.map(p => (
            <Button 
              key={p.id}
              variant="ghost" 
              className={cn(
                "w-full justify-start text-[10px] font-bold uppercase tracking-widest h-9",
                activePlaylistId === p.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              )}
              onClick={() => setActivePlaylistId(p.id)}
            >
              <FolderPlus size={14} className="mr-2" /> {p.name}
            </Button>
          ))}
        </div>

        {/* Main Gallery Area */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 p-2 rounded-xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
              {activePlaylistId === 'all' ? 'All Intel' : playlists.find(p => p.id === activePlaylistId)?.name} • {filteredAndSortedImages.length} Items
            </p>
            <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
              <SelectTrigger className="w-32 h-7 bg-slate-950 border-slate-800 text-[9px] font-black uppercase">
                <ArrowUpDown size={10} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-white">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredAndSortedImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredAndSortedImages.map((img) => (
                <div key={img.id} className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                  <img src={img.url} alt="Capture" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white" onClick={() => setSelectedImage(img)}><Maximize2 size={18} /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400" onClick={() => setEditingImage(img)}><Edit2 size={18} /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400" onClick={() => removeImage(img.id)}><Trash2 size={18} /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No captures in this playlist</p>
            </div>
          )}
        </div>
      </div>

      {/* New Playlist Dialog */}
      <Dialog open={isNewPlaylistOpen} onOpenChange={setIsNewPlaylistOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white">
          <DialogHeader><DialogTitle className="italic uppercase font-black">CREATE PLAYLIST</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Playlist Name</Label>
              <Input value={newPlaylist.name} onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})} className="bg-slate-900 border-slate-800" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Description</Label>
              <Textarea value={newPlaylist.description} onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})} className="bg-slate-900 border-slate-800" />
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreatePlaylist} className="w-full bg-indigo-600 font-black uppercase py-6">INITIALIZE PLAYLIST</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full View Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <Button variant="ghost" size="icon" className="absolute top-8 right-8 text-white hover:bg-white/10 rounded-full h-12 w-12" onClick={() => setSelectedImage(null)}><X size={32} /></Button>
          <div className="max-w-5xl w-full space-y-6">
            <img src={selectedImage.url} alt="Full view" className="w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-slate-800" />
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md space-y-2">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2"><Calendar size={12} /> {new Date(selectedImage.timestamp).toLocaleString()}</p>
              <p className="text-lg font-bold text-white italic">{selectedImage.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileGallery;