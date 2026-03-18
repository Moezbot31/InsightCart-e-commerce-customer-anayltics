import React, { useRef, useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign, Award, PlayCircle, RefreshCw, Database, FileText, Globe, X, Plus, BarChart2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import Markdown from 'react-markdown';
import { DataSourceSelector } from './DataSourceSelector';
import { DrillDownChart } from './DrillDownChart';

export const ExecutiveOverview: React.FC = () => {
  const { 
    filteredAnalysis: analysis, 
    filters, 
    setFilters, 
    runPipeline, 
    loading, 
    status, 
    history, 
    setAnalysis,
    config,
    setConfig
  } = usePipeline();

  const [showGetData, setShowGetData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const countries = React.useMemo(() => {
    if (!analysis?.rawData) return ['All'];
    const uniqueCountries = Array.from(new Set(analysis.rawData.map(t => t.country)));
    return ['All', ...uniqueCountries.sort()];
  }, [analysis]);

  const categories = React.useMemo(() => {
    if (!analysis?.rawData) return ['All'];
    const uniqueCategories = Array.from(new Set(analysis.rawData.map(t => t.category).filter(Boolean)));
    return ['All', ...uniqueCategories.sort() as string[]];
  }, [analysis]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (fileExt === 'json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          runPipeline(Array.isArray(json) ? json : [json]);
        } catch (err) {
          console.error("Failed to parse JSON", err);
        }
      };
      reader.readAsText(file);
    } else {
      // Default to CSV parsing for .csv and others
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          runPipeline(results.data);
        },
      });
    }
    
    // Reset input
    e.target.value = '';
  };

  if (!analysis && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-[#141414] rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm p-12 text-center transition-colors">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-6">
          <PlayCircle size={40} />
        </div>
        <h3 className="text-2xl font-bold mb-2 dark:text-white">No Data Loaded</h3>
        <p className="text-gray-400 dark:text-gray-500 max-w-sm mx-auto mb-8">Run the data pipeline to fetch and analyze your latest transaction data.</p>
        <div className="flex flex-col items-center gap-6 mb-8">
          <button 
            onClick={() => setShowGetData(true)}
            className="group relative px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] font-bold text-base uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-black/20 dark:shadow-white/10 flex items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus size={24} className="relative z-10" />
            <span className="relative z-10">Get Data</span>
          </button>
          
          <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
            <div className="h-px w-12 bg-gray-200 dark:bg-white/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest">or</span>
            <div className="h-px w-12 bg-gray-200 dark:bg-white/10" />
          </div>

          <button 
            onClick={() => runPipeline(undefined, { source: 'mock' })}
            disabled={loading}
            className="px-8 py-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center gap-3"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <PlayCircle size={16} />}
            Try with Mock Data
          </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.xlsx,.xls,.json" className="hidden" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-emerald-600 dark:text-emerald-400 mb-4" size={48} />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {status === 'fetching' && 'Fetching Data...'}
          {status === 'preprocessing' && 'Cleaning & Preprocessing...'}
          {status === 'clustering' && 'Running RFM Analysis...'}
          {status === 'ai_insights' && 'Generating AI Insights...'}
          {!status || status === 'idle' && 'Initializing...'}
        </p>
      </div>
    );
  }

  const { error } = usePipeline();

  return (
    <div className="space-y-8">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400"
          >
            <X size={18} className="shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest">Pipeline Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!analysis ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-[#141414] rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm p-12 text-center transition-colors">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-6">
            <PlayCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold mb-2 dark:text-white">No Data Loaded</h3>
          <p className="text-gray-400 dark:text-gray-500 max-w-sm mx-auto mb-8">Run the data pipeline to fetch and analyze your latest transaction data.</p>
          <button 
            onClick={() => setShowGetData(true)}
            className="group relative px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] font-bold text-base uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-black/20 dark:shadow-white/10 flex items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus size={24} className="relative z-10" />
            <span className="relative z-10">Get Data</span>
          </button>
        </div>
      ) : (
        <>
          {/* Header with Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight dark:text-white">Executive Overview</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">Strategic performance metrics and trends</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowGetData(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10 dark:shadow-white/5"
              >
                <Plus size={14} />
                Get Data
              </button>

              {history.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl transition-all shadow-sm">
                  <Database size={14} className="text-gray-400" />
                  <select 
                    value={analysis?.id || ''}
                    onChange={(e) => {
                      const selected = history.find(h => h.id === e.target.value);
                      if (selected) setAnalysis(selected);
                    }}
                    className="bg-transparent text-xs font-bold outline-none dark:text-white"
                  >
                    {history.map((h, idx) => (
                      <option key={h.id || idx} value={h.id} className="dark:bg-[#141414]">
                        {new Date(h.timestamp).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button 
                onClick={() => {
                  if (config.source === 'csv') {
                    fileInputRef.current?.click();
                  } else {
                    runPipeline();
                  }
                }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/10 dark:shadow-white/5 disabled:opacity-50"
              >
                {loading ? <Database className="animate-spin" size={14} /> : <Database size={14} />}
                Run Data Pipeline
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.xlsx,.xls,.json" className="hidden" />
              <button 
                onClick={() => runPipeline()}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm disabled:opacity-50 dark:text-white"
              >
                {loading ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                Refresh Data
              </button>
            </div>
          </div>

          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Revenue', value: `$${analysis.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Total Orders', value: analysis.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Total Customers', value: analysis.totalCustomers.toLocaleString(), icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
              { label: 'Avg Order Value', value: `$${analysis.avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { label: 'Avg CLV', value: `$${analysis.avgCLV.toFixed(2)}`, icon: Award, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            ].map((kpi, i) => (
              <motion.div 
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors"
              >
                <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-4`}>
                  <kpi.icon size={20} />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-1">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</h3>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">Sales Trend Over Time</h3>
            <div className="flex gap-2">
              <select 
                value={filters.country}
                onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                className="text-[10px] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white"
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select 
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="text-[10px] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysis.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#141414', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Country */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-6">Revenue by Country</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.revenueByCountry} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="country" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 600 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb', opacity: 0.1 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#141414', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {analysis.revenueByCountry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#374151'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Drill-Down Analysis */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center">
            <BarChart2 size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold dark:text-white">Advanced Drill-Down Analysis</h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Interactive Hierarchical Exploration</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analysis.rawData && analysis.rawData.length > 0 ? (
            <>
              <DrillDownChart 
                data={analysis.rawData} 
                title="Time-Series Drill Down" 
                type="time" 
              />
              <DrillDownChart 
                data={analysis.rawData} 
                title="Hierarchy Drill Down" 
                type="hierarchy" 
              />
            </>
          ) : (
            <div className="lg:col-span-2 bg-white dark:bg-[#141414] p-12 rounded-[2.5rem] border border-dashed border-black/10 dark:border-white/10 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-widest">
                Raw data required for advanced drill-down analysis. 
                <br />
                Please run a new pipeline to enable these features.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Get Data Modal */}
      <AnimatePresence>
        {showGetData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGetData(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#F5F5F4] dark:bg-[#0A0A0A] rounded-[3rem] shadow-2xl overflow-hidden border border-black/5 dark:border-white/5"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight dark:text-white">Get Data</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select a data source to begin your analysis</p>
                  </div>
                  <button 
                    onClick={() => setShowGetData(false)}
                    className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors text-gray-400"
                  >
                    <X size={24} />
                  </button>
                </div>

                <DataSourceSelector 
                  onSelect={(sourceId) => {
                    if (['csv', 'excel', 'json'].includes(sourceId)) {
                      fileInputRef.current?.click();
                    } else {
                      // Pass sourceId as override to avoid stale state issues
                      runPipeline(undefined, { source: sourceId as any });
                    }
                    setShowGetData(false);
                  }}
                />

                <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 flex justify-end">
                  <button 
                    onClick={() => setShowGetData(false)}
                    className="px-8 py-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/10 transition-all dark:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
