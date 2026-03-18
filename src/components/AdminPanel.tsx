import React, { useRef, useState } from 'react';
import { 
  Settings, Database, RefreshCw, FileText, Terminal, Globe, 
  Play, LogOut, User, ChevronLeft, Clock, BarChart2, Trash2, Download,
  FileSpreadsheet, FileJson, Table, Cloud, Share2, Save, Building2, Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { usePipeline } from '../context/PipelineContext';
import { useAuth } from '../context/AuthContext';
import Papa from 'papaparse';
import { DataSourceSelector } from './DataSourceSelector';

export const AdminPanel: React.FC = () => {
  const { profile, updateProfile, signOut, isAnalyst, isExecutive } = useAuth();
  const { config, setConfig, runPipeline, loading, status, history, setAnalysis, cleaningStats, deleteAnalysis, clearHistory, fetchHistory } = usePipeline();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    organization: profile?.organization || ''
  });

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await updateProfile({
        displayName: formData.displayName,
        organization: formData.organization
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        runPipeline(results.data);
      },
    });
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0A] transition-colors">
      <header className="bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
              <Settings size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight dark:text-white">Admin Control Panel</h1>
          </div>
        </div>
        
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#141414] p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest dark:text-white">Profile Settings</h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] font-bold text-blue-500 hover:underline uppercase tracking-widest"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 uppercase tracking-widest"
                  >
                    {saveLoading ? '...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <User size={40} />
              </div>
              {isEditing ? (
                <div className="space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Display Name</label>
                    <input 
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-black border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-xs outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Organization</label>
                    <input 
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-black border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-xs outline-none dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold dark:text-white">{profile.displayName}</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-mono uppercase tracking-widest mt-1">{profile.role}</p>
                  {profile.organization && (
                    <p className="text-[10px] text-gray-400 mt-1 italic">{profile.organization}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {(isAnalyst || isExecutive) && (
            <div className="bg-white dark:bg-[#141414] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 dark:text-white">
                <Database size={16} className="text-gray-400 dark:text-gray-500" />
                Pipeline Configuration
              </h3>

            <div className="space-y-6">
              <div>
                <DataSourceSelector 
                  onSelect={(sourceId) => {
                    if (sourceId === 'csv' || sourceId === 'excel' || sourceId === 'json') {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="mb-6"
                />

                {/* Connection Settings for Cloud Sources */}
                {['sql', 'azure', 'bigquery', 'sheets', 'api'].includes(config.source) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-3 mb-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Connection Settings</h4>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 uppercase">Ready</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder={config.source === 'sheets' ? "Spreadsheet ID or URL" : "Server Host / Endpoint URL"}
                        className="w-full bg-white dark:bg-black border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-black dark:focus:ring-white dark:text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Username" className="w-full bg-white dark:bg-black border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-xs outline-none dark:text-white" />
                        <input type="password" placeholder="Password / Token" className="w-full bg-white dark:bg-black border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-xs outline-none dark:text-white" />
                      </div>
                    </div>
                    <button 
                      onClick={() => runPipeline()}
                      className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
                    >
                      Test & Connect
                    </button>
                  </motion.div>
                )}
                {config.source === 'csv' && (
                  <button 
                    onClick={() => {
                      const sample = [
                        { invoiceNo: '536365', stockCode: '85123A', description: 'WHITE HANGING HEART T-LIGHT HOLDER', quantity: 6, invoiceDate: '2023-12-01 08:26', unitPrice: 2.55, customerId: '17850', country: 'United Kingdom' },
                        { invoiceNo: '536366', stockCode: '22633', description: 'HAND WARMER UNION JACK', quantity: 6, invoiceDate: '2023-12-01 08:28', unitPrice: 1.85, customerId: '17850', country: 'United Kingdom' }
                      ];
                      const csv = Papa.unparse(sample);
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = 'sample_transactions.csv';
                      link.click();
                    }}
                    className="mt-2 text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <Download size={10} />
                    Download Sample CSV
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.xlsx,.xls,.json" className="hidden" />
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase mb-3 block">Analysis Model</label>
                <select 
                  value={config.type}
                  onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white transition-colors"
                >
                  <option value="standard">Standard RFM (K-Means)</option>
                  <option value="aggressive">Aggressive Growth</option>
                  <option value="retention">Churn Prevention</option>
                </select>
              </div>

              <button 
                onClick={() => runPipeline()}
                disabled={loading}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    {status.replace('_', ' ')}...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Execute Pipeline
                  </>
                )}
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Right Column: History & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#141414] p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 dark:text-white">
                <Clock size={16} className="text-gray-400 dark:text-gray-500" />
                Analysis History
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fetchHistory()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white"
                  title="Refresh History"
                >
                  <RefreshCw size={14} />
                </button>
                {history.length > 0 && (
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                        clearHistory();
                      }
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-lg transition-all"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {history.map(h => (
                <div 
                  key={h.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                >
                  <div>
                    <p className="font-bold text-sm dark:text-white">{new Date(h.timestamp).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono uppercase">{h.pipelineConfig || 'standard'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold dark:text-white">${h.totalRevenue.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Revenue</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setAnalysis(h);
                          navigate('/');
                        }}
                        className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-800 dark:hover:bg-gray-200"
                        title="Load Analysis"
                      >
                        <ChevronLeft size={16} className="rotate-180" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this analysis?')) {
                            deleteAnalysis(h.id!);
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Analysis"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {cleaningStats && (
            <div className="bg-white dark:bg-[#141414] p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm transition-colors">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 dark:text-white">
                <BarChart2 size={16} className="text-gray-400 dark:text-gray-500" />
                Latest Cleaning Report
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox label="Duplicates" value={cleaningStats.duplicatesRemoved} color="blue" />
                <StatBox label="Missing" value={cleaningStats.missingValuesHandled} color="amber" />
                <StatBox label="Outliers" value={cleaningStats.outliersHandled} color="red" />
                <StatBox label="Fixed" value={cleaningStats.inconsistenciesFixed} color="emerald" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StatBox = ({ label, value, color }: { label: string, value: number, color: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  };
  return (
    <div className={`${colors[color]} p-4 rounded-2xl border border-current/10 transition-colors`}>
      <p className="text-[8px] font-mono uppercase tracking-widest mb-1 opacity-70">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};
