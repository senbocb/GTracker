"use client";

import React from 'react';
import { History as HistoryIcon, Filter, Search, Download, Calendar, Swords } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MatchHistory from '@/components/MatchHistory';
import AppLayout from '@/components/AppLayout';

const History = () => {
  return (
    <AppLayout>
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2 italic uppercase">Match History</h1>
            <p className="text-slate-400 font-medium">Review every engagement and outcome across all tracked games.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800">
              <Calendar className="mr-2" size={18} />
              Date Range
            </Button>
            <Button variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800">
              <Download className="mr-2" size={18} />
              Export
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <Input 
              placeholder="Search by map, agent, or result..." 
              className="bg-slate-900 border-slate-800 pl-10 h-12 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" className="border-slate-800 bg-slate-900/50 h-12 px-6">
            <Filter className="mr-2" size={18} />
            Filters
          </Button>
        </div>

        <div className="space-y-6">
          <div className="p-1 rounded-2xl bg-slate-800/10 border border-slate-800/50">
            <MatchHistory matches={[]} />
          </div>
          
          <div className="p-12 rounded-2xl bg-slate-900/20 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-700">
              <Swords size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">End of History</p>
              <p className="text-xs text-slate-600">No further data available for the selected period.</p>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default History;