import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
import { Transaction } from '../types';

interface DrillDownChartProps {
  data: Transaction[];
  title: string;
  type: 'time' | 'hierarchy';
}

export const DrillDownChart: React.FC<DrillDownChartProps> = ({ data, title, type }) => {
  const [level, setLevel] = useState(0); // 0: Top, 1: Mid, 2: Deep
  const [filter, setFilter] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const chartData = useMemo(() => {
    if (type === 'time') {
      if (level === 0) {
        // Yearly
        const yearly = data.reduce((acc: any, t) => {
          const year = new Date(t.invoiceDate).getFullYear().toString();
          acc[year] = (acc[year] || 0) + (t.unitPrice * t.quantity);
          return acc;
        }, {});
        return Object.entries(yearly).map(([name, value]) => ({ name, value }));
      } else if (level === 1) {
        // Monthly for specific year
        const monthly = data
          .filter(t => new Date(t.invoiceDate).getFullYear().toString() === filter)
          .reduce((acc: any, t) => {
            const month = new Date(t.invoiceDate).toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + (t.unitPrice * t.quantity);
            return acc;
          }, {});
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map(m => ({ name: m, value: monthly[m] || 0 }));
      } else {
        // Daily for specific month/year
        // filter format: "Year-Month"
        const [year, month] = filter!.split('-');
        const daily = data
          .filter(t => {
            const d = new Date(t.invoiceDate);
            return d.getFullYear().toString() === year && 
                   d.toLocaleString('default', { month: 'short' }) === month;
          })
          .reduce((acc: any, t) => {
            const day = new Date(t.invoiceDate).getDate().toString();
            acc[day] = (acc[day] || 0) + (t.unitPrice * t.quantity);
            return acc;
          }, {});
        return Object.entries(daily)
          .map(([name, value]) => ({ name: parseInt(name), value: value as number }))
          .sort((a, b) => a.name - b.name)
          .map(item => ({ name: item.name.toString(), value: item.value }));
      }
    } else {
      // Hierarchy: Category -> Subcategory -> Product
      if (level === 0) {
        const categories = data.reduce((acc: any, t) => {
          const cat = t.category || 'Uncategorized';
          acc[cat] = (acc[cat] || 0) + (t.unitPrice * t.quantity);
          return acc;
        }, {});
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
      } else if (level === 1) {
        const subcategories = data
          .filter(t => t.category === filter)
          .reduce((acc: any, t) => {
            const sub = t.subcategory || 'Other';
            acc[sub] = (acc[sub] || 0) + (t.unitPrice * t.quantity);
            return acc;
          }, {});
        return Object.entries(subcategories).map(([name, value]) => ({ name, value }));
      } else {
        const products = data
          .filter(t => t.subcategory === filter)
          .reduce((acc: any, t) => {
            const prod = t.description;
            acc[prod] = (acc[prod] || 0) + (t.unitPrice * t.quantity);
            return acc;
          }, {});
        return Object.entries(products)
          .map(([name, value]) => ({ name, value: value as number }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 15);
      }
    }
  }, [data, level, filter, type]);

  const handleBack = () => {
    if (level === 0) return;
    if (level === 1) {
      setLevel(0);
      setFilter(null);
    } else {
      setLevel(1);
      // For time, we need to restore the year filter
      if (type === 'time') {
        setFilter(filter!.split('-')[0]);
      } else {
        // For hierarchy, we need to find the category of the current subcategory
        const sample = data.find(t => t.subcategory === filter);
        setFilter(sample?.category || null);
      }
    }
  };

  const handleClick = (state: any) => {
    if (level === 2) return;
    if (!state || !state.activePayload || state.activePayload.length === 0) return;
    
    const data = state.activePayload[0].payload;
    if (!data || !data.name) return;

    if (type === 'time') {
      if (level === 0) {
        setFilter(data.name);
        setLevel(1);
      } else {
        setFilter(`${filter}-${data.name}`);
        setLevel(2);
      }
    } else {
      setFilter(data.name);
      setLevel(level + 1);
    }
  };

  const breadcrumbs = useMemo(() => {
    if (level === 0) return type === 'time' ? 'All Years' : 'All Categories';
    return filter;
  }, [level, filter, type]);

  return (
    <div className={`bg-white dark:bg-[#141414] p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm transition-all ${isExpanded ? 'fixed inset-4 z-[60] m-0' : 'relative'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {level > 0 && (
              <button 
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">{title}</h3>
          </div>
          <p className="text-lg font-bold dark:text-white flex items-center gap-2">
            {breadcrumbs}
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded">
              Level {level + 1}
            </span>
          </p>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-400"
        >
          {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      <div className={isExpanded ? 'h-[calc(100%-100px)]' : 'h-[300px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            onClick={handleClick}
            style={{ cursor: level < 2 ? 'pointer' : 'default' }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" opacity={0.1} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              interval={0}
              angle={chartData.length > 8 ? -45 : 0}
              textAnchor={chartData.length > 8 ? "end" : "middle"}
              height={chartData.length > 8 ? 60 : 30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
            />
            <Tooltip 
              cursor={{ fill: '#f9fafb', opacity: 0.05 }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#141414', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]} 
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={level === 0 ? '#10b981' : level === 1 ? '#3b82f6' : '#8b5cf6'} 
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        <span>{level < 2 ? 'Click bars to drill down' : 'Deepest level reached'}</span>
        {level > 0 && <span>Click arrow to go back</span>}
      </div>
    </div>
  );
};
