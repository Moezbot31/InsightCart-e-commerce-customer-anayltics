import React from 'react';
import { usePipeline } from '../context/PipelineContext';
import { Filter, X } from 'lucide-react';

export const DashboardFilters: React.FC = () => {
  const { filters, setFilters, analysis } = usePipeline();

  const countries = React.useMemo(() => {
    if (!analysis?.rawData) return ['All'];
    const uniqueCountries = Array.from(new Set(analysis.rawData.map(t => t.country)));
    return ['All', ...uniqueCountries.sort()];
  }, [analysis]);

  const segments = React.useMemo(() => {
    if (!analysis?.segments) return ['All'];
    return ['All', ...analysis.segments.map(s => s.name)];
  }, [analysis]);

  const categories = React.useMemo(() => {
    if (!analysis?.rawData) return ['All'];
    const uniqueCategories = Array.from(new Set(analysis.rawData.map(t => t.category).filter(Boolean)));
    return ['All', ...uniqueCategories.sort()];
  }, [analysis]);

  const handleReset = () => {
    setFilters({
      country: 'All',
      category: 'All',
      dateRange: ['', ''],
      segment: 'All'
    });
  };

  return (
    <div className="bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-white/5 p-4 sticky top-0 z-10 shadow-sm transition-colors">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mr-2">
          <Filter size={16} />
          <span className="text-[10px] uppercase tracking-widest font-semibold">Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Country Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-tighter text-gray-400 dark:text-gray-500 font-bold">Country</label>
            <select 
              value={filters.country}
              onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white"
            >
              {countries.map(c => <option key={c} value={c} className="dark:bg-[#141414]">{c}</option>)}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-tighter text-gray-400 dark:text-gray-500 font-bold">Category</label>
            <select 
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white"
            >
              {categories.map(c => <option key={c} value={c} className="dark:bg-[#141414]">{c}</option>)}
            </select>
          </div>

          {/* Segment Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-tighter text-gray-400 dark:text-gray-500 font-bold">Segment</label>
            <select 
              value={filters.segment}
              onChange={(e) => setFilters(prev => ({ ...prev, segment: e.target.value }))}
              className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white"
            >
              {segments.map(s => <option key={s} value={s} className="dark:bg-[#141414]">{s}</option>)}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-tighter text-gray-400 dark:text-gray-500 font-bold">Date Range</label>
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={filters.dateRange[0]}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: [e.target.value, prev.dateRange[1]] }))}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input 
                type="date"
                value={filters.dateRange[1]}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: [prev.dateRange[0], e.target.value] }))}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleReset}
          className="flex items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold"
        >
          <X size={14} />
          Reset
        </button>
      </div>
    </div>
  );
};
