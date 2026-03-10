"use client";

import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ChevronLeft, History as HistoryIcon, Filter, Search, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import MatchHistory from '@/components/MatchHistory';

const History = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <Link to="/">
          <Button variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4">
            <ChevronLeft className="mr-2" size={20} />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">COMBAT LOGS</h1>
            <p className="text-slate-400 font-medium">Review every engagement and tactical outcome.</p>
          </div>
          <Button variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800">
            <Download className="mr-2" size={18} />
            EXPORT DATA
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <Input 
              placeholder="Search by map, agent, or result..." 
              className="bg-slate-900 border-slate-800 pl-10 h-12"
            />
          </div>
          <Button variant="outline" className="border-slate-800 bg-slate-900/50 h-12 px-6">
            <Filter className="mr-2" size={18} />
            FILTERS
          </Button>
        </div>

        <div className="space-y-6">
          <div className="p-1 rounded-2xl bg-slate-800/30 border border-slate-800">
            <MatchHistory />
          </div>
          
          {/* Mocking more history for this page */}
          <div className="p-1 rounded-2xl bg-slate-800/30 border border-slate-800 opacity-60">
            <div className="p-6 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
              End of Recent Logs • Load More
            </div>
          </div>
        </div>

        <footer className="mt-20 pb-10 border-t border-slate-800 pt-10">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
};

export default History;