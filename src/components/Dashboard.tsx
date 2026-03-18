import React, { useState } from 'react';
import { 
  TrendingUp, Users, DollarSign, 
  RefreshCw, BrainCircuit, ChevronRight,
  Database, Search, AlertCircle, Play, Shield, Sparkles,
  X, User, LayoutDashboard, PieChart as PieChartIcon, ShoppingCart, FileText, Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import { usePipeline } from '../context/PipelineContext';
import { useAuth } from '../context/AuthContext';
import { DashboardFilters } from './DashboardFilters';
import { ExecutiveOverview } from './ExecutiveOverview';
import { SegmentationInsights } from './SegmentationInsights';
import { ProductSales } from './ProductSales';
import { AIChatBot } from './AIChatBot';

import { CustomDashboardBuilder } from './CustomDashboardBuilder';

export const Dashboard: React.FC = () => {
  const { 
    analysis, filteredAnalysis, loading, status, error, 
    runPipeline 
  } = usePipeline();
  const { isAnalyst, isExecutive, signOut, profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'segmentation' | 'products' | 'insights' | 'custom'>(
    isAnalyst ? 'segmentation' : 'overview'
  );
  const navigate = useNavigate();

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'segmentation', label: 'Customer Segmentation', icon: PieChartIcon },
    { id: 'products', label: 'Product & Sales Analytics', icon: ShoppingCart },
    { id: 'insights', label: 'AI Strategic Report', icon: BrainCircuit }
  ];

  if (isAnalyst) {
    tabs.push({ id: 'custom', label: 'Custom Dashboards', icon: Grid });
  }

  return (
    <div className="min-h-screen bg-[#F5F5F4] dark:bg-[#0A0A0A] font-sans text-[#141414] dark:text-white transition-colors duration-300">
      <header className="bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
            <Database size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">InsightCart</h1>
            <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Enterprise Analytics Pipeline</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <nav className="hidden lg:flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="h-8 w-px bg-black/5 dark:bg-white/5 mx-2"></div>

          <Link 
            to="/raw-data"
            className="flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors font-bold text-xs uppercase tracking-wider bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5"
          >
            <FileText size={16} />
            Raw Data
          </Link>

          <Link 
            to="/admin"
            className="flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors font-bold text-xs uppercase tracking-wider bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5"
          >
            <Shield size={16} />
            Admin
          </Link>

          <button 
            onClick={signOut}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
            title="Sign Out"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {analysis && <DashboardFilters />}

      <main className="max-w-[1600px] mx-auto p-8">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {loading && !analysis && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-[#141414] rounded-3xl border border-black/5 dark:border-white/5 transition-colors"
            >
              <div className="relative">
                <RefreshCw size={48} className="text-black dark:text-white animate-spin mb-6" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Processing Data Pipeline</h3>
              <p className="text-gray-400 dark:text-gray-500 uppercase font-mono text-[10px] tracking-widest">{status.replace('_', ' ')}</p>
            </motion.div>
          )}

          {!analysis && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-[#141414] rounded-3xl border border-dashed border-black/10 dark:border-white/10 transition-colors"
            >
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Database size={40} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Ready for Analysis</h3>
              <p className="text-gray-400 dark:text-gray-500 max-w-md mx-auto mb-8">
                {isAnalyst 
                  ? "Connect a data source and run the pipeline to generate your first RFM customer segmentation analysis." 
                  : "No analysis data available. Run the data pipeline to generate strategic insights and performance metrics."}
              </p>
              <div className="flex gap-4">
                {isAnalyst ? (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl shadow-black/10 dark:shadow-white/5"
                  >
                    Configure Pipeline
                  </button>
                ) : (
                  <button 
                    onClick={() => runPipeline()}
                    className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl shadow-black/10 dark:shadow-white/5 flex items-center gap-3"
                  >
                    <Play size={20} />
                    Run Data Pipeline
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {filteredAnalysis && (
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <ExecutiveOverview />
                </motion.div>
              )}

              {activeTab === 'segmentation' && (
                <motion.div key="segmentation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <SegmentationInsights />
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <ProductSales />
                </motion.div>
              )}

              {activeTab === 'insights' && (
                <motion.div 
                  key="insights" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }} 
                  className="bg-white dark:bg-[#141414] p-16 rounded-[3rem] border border-black/5 dark:border-white/5 shadow-sm transition-colors relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                    <BrainCircuit size={300} />
                  </div>

                  <div className="max-w-4xl mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center mb-20">
                      <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-3xl flex items-center justify-center shadow-2xl mb-8">
                        <BrainCircuit size={36} />
                      </div>
                      <h3 className="text-4xl font-bold tracking-tight dark:text-white mb-4">Executive Strategic Report</h3>
                      <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500">
                        <span className="text-[10px] uppercase font-mono tracking-[0.3em] font-bold">Generated by Gemini 3.1 Pro</span>
                        <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        <span className="text-[10px] uppercase font-mono tracking-[0.3em] font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <div className="prose prose-xl max-w-none dark:prose-invert 
                      prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black dark:prose-headings:text-white
                      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:font-serif prose-p:leading-relaxed
                      prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:font-serif
                      prose-strong:text-black dark:prose-strong:text-white
                      prose-blockquote:border-l-black dark:prose-blockquote:border-l-white prose-blockquote:italic prose-blockquote:font-serif
                    ">
                      <Markdown>{filteredAnalysis.aiInsights || "No insights generated yet."}</Markdown>
                    </div>

                    <div className="mt-20 pt-12 border-t border-black/5 dark:border-white/5 flex flex-col items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">End of Strategic Analysis</span>
                      </div>
                      <button 
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center gap-2"
                      >
                        <FileText size={14} />
                        Export to PDF
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'custom' && isAnalyst && (
                <motion.div key="custom" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <CustomDashboardBuilder />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
      <AIChatBot />
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${colorClasses[color]}`}>{icon}</div>
      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
};

const Metric = ({ label, value }: { label: string, value: string | number }) => (
  <div className="text-center">
    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold">{value}</p>
  </div>
);
