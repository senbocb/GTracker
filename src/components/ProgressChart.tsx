"use client";

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Calendar } from 'lucide-react';
import { subDays, isAfter, format } from 'date-fns';

interface ProgressChartProps {
  history?: any[];
  rankNames?: string[];
  getRankValue: (rank: string, tier?: string) => number;
}

const ProgressChart = ({ history = [], rankNames = [], getRankValue }: ProgressChartProps) => {
  const [timeRange, setTimeRange] = useState('all');

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Filter by time range
    const now = new Date();
    let filteredHistory = [...history];
    
    if (timeRange !== 'all') {
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
      const cutoff = subDays(now, days);
      filteredHistory = history.filter(h => isAfter(new Date(h.timestamp), cutoff));
    }

    // Sort chronologically for the graph
    const sorted = filteredHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let peakSoFar = 0;
    return sorted.map(h => {
      const currentVal = getRankValue(h.rank, h.tier);
      if (currentVal > peakSoFar) peakSoFar = currentVal;
      
      return {
        date: format(new Date(h.timestamp), 'MMM dd'),
        fullDate: new Date(h.timestamp).toLocaleDateString(),
        current: currentVal,
        peak: peakSoFar,
        rankLabel: `${h.rank} ${h.tier || ''}`.trim()
      };
    });
  }, [history, timeRange, getRankValue]);

  const yAxisFormatter = (value: number) => {
    if (rankNames.length > 0) {
      const index = Math.floor(value / 100) - 1;
      return rankNames[index] || value.toString();
    }
    return value.toString();
  };

  return (
    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <BarChart3 size={16} className="text-indigo-500" />
          Performance Trajectory
        </CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 h-8 bg-slate-950 border-slate-800 text-[10px] font-black uppercase">
            <Calendar size={12} className="mr-2 text-indigo-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border-slate-800 text-white">
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full pt-4">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={yAxisFormatter}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}
                  formatter={(value: number, name: string, props: any) => {
                    if (name === "Current Rank") return [props.payload.rankLabel, name];
                    return [yAxisFormatter(value), name];
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }} />
                <Line 
                  name="Current Rank"
                  type="monotone" 
                  dataKey="current" 
                  stroke="#38bdf8" 
                  strokeWidth={3} 
                  dot={{ fill: '#38bdf8', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  name="Peak Rank"
                  type="stepAfter" 
                  dataKey="peak" 
                  stroke="#eab308" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <BarChart3 className="text-slate-800" size={48} />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Insufficient data for trajectory analysis</p>
              <p className="text-[10px] text-slate-500 uppercase">Log at least two rank changes to generate graph</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;