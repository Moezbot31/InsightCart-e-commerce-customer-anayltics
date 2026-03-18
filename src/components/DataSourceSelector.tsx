import React from 'react';
import { 
  RefreshCw, FileText, Database, Globe, 
  FileSpreadsheet, FileJson, Table, Cloud, Share2,
  Zap, Box, Layers, Cpu, PlayCircle
} from 'lucide-react';
import { usePipeline } from '../context/PipelineContext';

interface DataSourceSelectorProps {
  onSelect?: (sourceId: string) => void;
  className?: string;
}

export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ onSelect, className = "" }) => {
  const { config, setConfig } = usePipeline();

  const sources = [
    { id: 'mock', icon: <RefreshCw size={18} />, label: 'Mock Data', category: 'Standard' },
    { id: 'csv', icon: <FileText size={18} />, label: 'CSV File', category: 'Files' },
    { id: 'excel', icon: <FileSpreadsheet size={18} />, label: 'Excel', category: 'Files' },
    { id: 'json', icon: <FileJson size={18} />, label: 'JSON', category: 'Files' },
    { id: 'sql', icon: <Database size={18} />, label: 'SQL Server', category: 'Databases' },
    { id: 'azure', icon: <Cloud size={18} />, label: 'Azure SQL', category: 'Cloud' },
    { id: 'bigquery', icon: <Table size={18} />, label: 'BigQuery', category: 'Cloud' },
    { id: 'snowflake', icon: <Layers size={18} />, label: 'Snowflake', category: 'Cloud' },
    { id: 'sheets', icon: <Share2 size={18} />, label: 'G-Sheets', category: 'Online' },
    { id: 'api', icon: <Globe size={18} />, label: 'REST API', category: 'Online' },
    { id: 'salesforce', icon: <Zap size={18} />, label: 'Salesforce', category: 'Business' },
    { id: 'sap', icon: <Cpu size={18} />, label: 'SAP HANA', category: 'Business' },
  ];

  const categories = Array.from(new Set(sources.map(s => s.category)));

  return (
    <div className={`space-y-6 ${className}`}>
      {categories.map(category => (
        <div key={category}>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 ml-1">{category}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sources.filter(s => s.category === category).map(source => (
              <button
                key={source.id}
                onClick={() => {
                  setConfig(prev => ({ ...prev, source: source.id as any }));
                }}
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all group relative ${
                  config.source === source.id 
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xl shadow-black/10' 
                    : 'bg-white dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400 border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 hover:shadow-md'
                }`}
              >
                {config.source === source.id && !['csv', 'excel', 'json'].includes(source.id) && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg animate-bounce">
                    <Zap size={12} fill="currentColor" />
                  </div>
                )}
                <div className={`p-2 rounded-xl transition-colors ${
                  config.source === source.id 
                    ? 'bg-white/20 dark:bg-black/10' 
                    : 'bg-gray-50 dark:bg-white/5 group-hover:bg-gray-100 dark:group-hover:bg-white/10'
                }`}>
                  {source.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-center">{source.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-black/5 dark:border-white/5">
        <button
          onClick={() => {
            if (onSelect) onSelect(config.source);
          }}
          disabled={!config.source}
          className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-black/10 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {['csv', 'excel', 'json'].includes(config.source) ? (
            <><FileText size={18} /> Select File & Upload</>
          ) : (
            <><PlayCircle size={18} /> Connect & Run Analysis</>
          )}
        </button>
      </div>
    </div>
  );
};
