import React from 'react';
import { usePipeline } from '../context/PipelineContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { motion } from 'motion/react';
import { Sparkles, BrainCircuit, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const SegmentationInsights: React.FC = () => {
  const { filteredAnalysis: analysis } = usePipeline();

  if (!analysis) return null;

  const revenueDistributionData = analysis.segments.map(s => ({
    name: s.name,
    value: s.revenue
  }));

  const repeatVsNewData = analysis.repeatVsNew.map(item => ({
    name: item.type,
    value: item.count
  }));

  return (
    <div className="space-y-8">
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Distribution */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-6">Revenue by Segment</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {revenueDistributionData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[10px] text-gray-500 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Repeat vs New */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-6">Repeat vs New Customers</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repeatVsNewData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#e5e7eb" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Purchase Frequency */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-6">Purchase Frequency</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.purchaseFrequency}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scatter Plot & Revenue Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">Customer Segmentation Clusters</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Recency vs Monetary value distribution by segment</p>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  dataKey="recency" 
                  name="Recency" 
                  unit=" days" 
                  label={{ value: 'Recency (Days)', position: 'insideBottom', offset: -10, fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="monetary" 
                  name="Monetary" 
                  unit="$" 
                  label={{ value: 'Monetary ($)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <ZAxis type="number" dataKey="frequency" range={[50, 400]} name="Frequency" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                {analysis.segments.map((segment, index) => (
                  <Scatter 
                    key={segment.name} 
                    name={segment.name} 
                    data={analysis.scatterData.filter(d => d.segment === segment.name)} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segment Revenue Contribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-6">Segment Revenue Contribution</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 600 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {revenueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
