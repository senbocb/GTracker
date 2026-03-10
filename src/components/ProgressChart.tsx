"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react';

const ProgressChart = ({ data = [] }: { data?: any[] }) => {
  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">Rank Rating Progress (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value}RR`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rr" 
                  stroke="#38bdf8" 
                  strokeWidth={3} 
                  dot={{ fill: '#38bdf8', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <BarChart3 className="text-slate-800" size={48} />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Insufficient data for analysis</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;