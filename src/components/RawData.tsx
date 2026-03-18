import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, Database, Search, Download, 
  Filter, ArrowUpDown, Calendar, Hash,
  TrendingUp, BarChart3, Package, BrainCircuit, LayoutDashboard
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePipeline } from '../context/PipelineContext';

import Papa from 'papaparse';

import { DashboardFilters } from './DashboardFilters';

export const RawData: React.FC = () => {
  const { filteredAnalysis: analysis } = usePipeline();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleExport = () => {
    if (!analysis?.rawData) return;
    const csv = Papa.unparse(analysis.rawData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `segmently_raw_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!analysis || !analysis.rawData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F4] dark:bg-[#0A0A0A] transition-colors">
        <div className="text-center max-w-md px-8">
          <Database size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h3 className="text-xl font-bold mb-2 dark:text-white">Raw Data Unavailable</h3>
          <p className="text-gray-400 dark:text-gray-500 mb-6 text-sm">
            Raw transaction logs are only available for the current active session to optimize storage. 
            Historical summaries and AI insights are preserved in your profile.
          </p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm uppercase tracking-widest">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredData = analysis.rawData.filter(t => 
    t.customerId?.toString().includes(searchTerm) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.stockCode?.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#F5F5F4] dark:bg-[#0A0A0A] font-sans text-[#141414] dark:text-white transition-colors">
      <header className="bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">Transaction Ledger</h1>
            <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Raw Cleaned Data • {analysis.rawData.length} Records</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <nav className="hidden lg:flex items-center gap-2">
            <Link to="/" className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-2">
              <LayoutDashboard size={14}/> Overview
            </Link>
            <button className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black shadow-md flex items-center gap-2">
              <Database size={14}/> Raw Data
            </button>
          </nav>

          <div className="h-8 w-px bg-black/5 dark:bg-white/5 mx-2"></div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search ID, Product, Code..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm outline-none w-64 dark:text-white" 
              />
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-black/10 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {analysis && <DashboardFilters />}

      <main className="max-w-[1600px] mx-auto p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#141414] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden transition-colors"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-white/5 text-[10px] font-mono uppercase text-gray-400 dark:text-gray-500 sticky top-0 z-10">
                <tr>
                  <th className="px-8 py-4"><div className="flex items-center gap-2"><Hash size={12}/> Invoice</div></th>
                  <th className="px-8 py-4"><div className="flex items-center gap-2"><Calendar size={12}/> Date</div></th>
                  <th className="px-8 py-4">Customer ID</th>
                  <th className="px-8 py-4">Stock Code</th>
                  <th className="px-8 py-4">Description</th>
                  <th className="px-8 py-4 text-right">Qty</th>
                  <th className="px-8 py-4 text-right">Price</th>
                  <th className="px-8 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredData.slice(0, 500).map((t, i) => (
                  <tr key={`${t.invoiceNo}-${i}`} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{t.invoiceNo}</td>
                    <td className="px-8 py-4 text-xs font-medium">{new Date(t.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-8 py-4 font-bold text-xs">{t.customerId}</td>
                    <td className="px-8 py-4 font-mono text-[10px] text-gray-400 dark:text-gray-500 uppercase">{t.stockCode}</td>
                    <td className="px-8 py-4 text-xs font-medium">{t.description}</td>
                    <td className="px-8 py-4 text-right text-xs font-bold">{t.quantity}</td>
                    <td className="px-8 py-4 text-right text-xs font-bold">${t.unitPrice.toFixed(2)}</td>
                    <td className="px-8 py-4 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">${(t.quantity * t.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length > 500 && (
            <div className="p-6 bg-gray-50 dark:bg-white/5 text-center border-t border-black/5 dark:border-white/5">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono uppercase">Showing first 500 records. Use search to find specific transactions.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};
