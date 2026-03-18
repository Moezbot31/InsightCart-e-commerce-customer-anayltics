import React from 'react';
import { usePipeline } from '../context/PipelineContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, Cell
} from 'recharts';
import { AlertTriangle, TrendingUp, Package, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';

export const ProductSales: React.FC = () => {
  const { filteredAnalysis: analysis } = usePipeline();
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const categories = React.useMemo(() => {
    if (!analysis) return ['All'];
    const cats = new Set(analysis.topProducts.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats).sort() as string[]];
  }, [analysis]);

  const filteredProducts = React.useMemo(() => {
    if (!analysis) return [];
    if (selectedCategory === 'All') return analysis.topProducts.slice(0, 10);
    return analysis.topProducts
      .filter(p => p.category === selectedCategory)
      .slice(0, 10);
  }, [analysis, selectedCategory]);

  const top5Categories = React.useMemo(() => {
    if (!analysis) return [];
    return analysis.categoryData.slice(0, 5);
  }, [analysis]);

  if (!analysis) return null;

  return (
    <div className="space-y-8">
      {/* Category Breakdown (Top 5) */}
      <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 size={16} className="text-emerald-500" />
          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">Market Share: Top 5 Categories</h3>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top5Categories} layout="vertical" margin={{ left: 20, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" opacity={0.1} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="category" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }}
                width={120}
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb', opacity: 0.05 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#141414', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {top5Categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Products with Filter */}
      <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">Top Selling Products</h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Highest revenue generating items</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Filter by Category:</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-[10px] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white font-bold dark:text-white"
            >
              {categories.map(c => <option key={c} value={c} className="dark:bg-[#141414]">{c}</option>)}
            </select>
          </div>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredProducts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="description" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#9ca3af' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Trends & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Demand Trends */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <Package size={16} className="text-blue-500" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">Product Demand Trends</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysis.productTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-6">Top Categories by Revenue</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="category" 
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
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Forecast */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={16} className="text-emerald-500" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">Future Sales Forecast</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analysis.forecastData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Forecasted Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 italic">Note: Forecast based on historical linear growth patterns.</p>
        </div>

        {/* Churn Risk */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={16} className="text-orange-500" />
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">Customer Churn Risk Analysis</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.churnRiskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="risk" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
                  {analysis.churnRiskData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.risk === 'High' ? '#ef4444' : entry.risk === 'Medium' ? '#f59e0b' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 italic">Risk calculated based on recency and frequency patterns.</p>
        </div>
      </div>
    </div>
  );
};
