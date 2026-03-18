import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, Users, TrendingUp, Calendar, DollarSign, 
  Target, Info, ArrowRight, Package, Search,
  Filter, BrainCircuit, BarChart3, List, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePipeline } from '../context/PipelineContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, ScatterChart, Scatter, ZAxis
} from 'recharts';
import Markdown from 'react-markdown';

export const SegmentDetail: React.FC = () => {
  const { segmentId } = useParams<{ segmentId: string }>();
  const { analysis } = usePipeline();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'avg' | 'segmentation' | 'products' | 'customers' | 'insights'>('avg');
  
  // Filters for customer list
  const [customerSearch, setCustomerSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F4]">
        <div className="text-center">
          <p className="text-gray-400 font-mono text-xs uppercase mb-4">No analysis data available</p>
          <button onClick={() => navigate('/')} className="text-black font-bold underline">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const segment = analysis.segments.find(s => s.id === segmentId);

  if (!segment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F4]">
        <div className="text-center">
          <p className="text-gray-400 font-mono text-xs uppercase mb-4">Segment not found</p>
          <button onClick={() => navigate('/')} className="text-black font-bold underline">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // Filter customer details for this segment
  const customers = useMemo(() => 
    analysis.customerDetails.filter(c => segment.customerIds.includes(c.customerId)),
    [analysis.customerDetails, segment.customerIds]
  );

  // Filtered customer list based on UI filters
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.customerId.toString().includes(customerSearch);
      const matchesDate = !dateFilter || new Date(c.lastPurchase).toISOString().split('T')[0] === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [customers, customerSearch, dateFilter]);

  // Calculate segment-specific top products
  const segmentProducts = useMemo(() => {
    if (!analysis.rawData) return [];
    const segmentTransactions = analysis.rawData.filter(t => segment.customerIds.includes(t.customerId));
    
    const productMap = new Map<string, { description: string, quantity: number, revenue: number }>();
    
    segmentTransactions.forEach(t => {
      const existing = productMap.get(t.stockCode) || { description: t.description, quantity: 0, revenue: 0 };
      productMap.set(t.stockCode, {
        description: t.description,
        quantity: existing.quantity + t.quantity,
        revenue: existing.revenue + (t.quantity * t.unitPrice)
      });
    });

    return Array.from(productMap.entries())
      .map(([stockCode, data]) => ({ stockCode, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [analysis.rawData, segment.customerIds]);

  return (
    <div className="min-h-screen bg-[#F5F5F4] font-sans text-[#141414]">
      <header className="bg-white border-b border-black/5 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                <h1 className="text-xl font-bold tracking-tight">{segment.name}</h1>
              </div>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Segment Deep-Dive • {segment.count} Customers</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {[
              { id: 'avg', label: 'Avg Metrics', icon: <TrendingUp size={14}/> },
              { id: 'segmentation', label: 'Segmentation', icon: <BarChart3 size={14}/> },
              { id: 'products', label: 'Products', icon: <Package size={14}/> },
              { id: 'customers', label: 'Customers', icon: <Users size={14}/> },
              { id: 'insights', label: 'Insights', icon: <BrainCircuit size={14}/> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <div className="h-6 w-px bg-black/5 mx-2"></div>
            <Link 
              to="/raw-data"
              className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
            >
              <Database size={14}/>
              Raw Data
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'avg' && (
            <motion.div key="avg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <DetailStat label="Avg Recency" value={`${segment.avgRecency} Days`} icon={<Calendar size={20} />} color="blue" />
                <DetailStat label="Avg Frequency" value={`${segment.avgFrequency} Orders`} icon={<TrendingUp size={20} />} color="emerald" />
                <DetailStat label="Avg Monetary" value={`$${segment.avgMonetary}`} icon={<DollarSign size={20} />} color="violet" />
                <DetailStat label="Contribution" value={`${Math.round((segment.count / analysis.totalCustomers) * 100)}%`} icon={<Target size={20} />} color="amber" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Info size={16} className="text-gray-400" />
                      Segment Characteristics
                    </h3>
                    <p className="text-gray-600 italic serif leading-relaxed mb-6">
                      {segment.description}
                    </p>
                    <div className="space-y-4">
                      <CharacteristicItem label="Engagement Level" value={segment.avgFrequency > 10 ? 'High' : 'Moderate'} />
                      <CharacteristicItem label="Churn Risk" value={segment.avgRecency > 180 ? 'Critical' : 'Low'} />
                      <CharacteristicItem label="Value Tier" value={segment.avgMonetary > 400 ? 'Premium' : 'Standard'} />
                    </div>
                  </div>

                  <div className="bg-black text-white p-8 rounded-3xl shadow-xl shadow-black/20">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Strategic Action</h3>
                    <p className="text-sm text-gray-300 leading-relaxed mb-6">
                      Based on current metrics, we recommend personalized re-engagement campaigns focusing on high-value products this segment previously interacted with.
                    </p>
                    <button className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
                      Generate Campaign <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Value Distribution</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customers.slice(0, 20)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="customerId" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="totalSpend" fill={segment.color} radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'segmentation' && (
            <motion.div key="segmentation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Purchase Behavior</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[
                            { name: 'Active', value: customers.filter(c => c.orderCount > 5).length },
                            { name: 'Occasional', value: customers.filter(c => c.orderCount <= 5 && c.orderCount > 1).length },
                            { name: 'One-time', value: customers.filter(c => c.orderCount === 1).length }
                          ]} 
                          cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value"
                        >
                          <Cell fill={segment.color} />
                          <Cell fill={`${segment.color}88`} />
                          <Cell fill={`${segment.color}44`} />
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Monetary Distribution</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { range: '0-100', count: customers.filter(c => c.totalSpend <= 100).length },
                        { range: '100-500', count: customers.filter(c => c.totalSpend > 100 && c.totalSpend <= 500).length },
                        { range: '500-1000', count: customers.filter(c => c.totalSpend > 500 && c.totalSpend <= 1000).length },
                        { range: '1000+', count: customers.filter(c => c.totalSpend > 1000).length }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Bar dataKey="count" fill={segment.color} radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Customer RFM Distribution (Within Segment)</h3>
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
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      />
                      <Scatter 
                        name={segment.name} 
                        data={analysis.scatterData.filter(d => d.segment === segment.name)} 
                        fill={segment.color} 
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-black/5">
                <h3 className="text-sm font-bold uppercase tracking-widest">Most Sold Products in this Segment</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-mono uppercase text-gray-400">
                  <tr>
                    <th className="px-8 py-4">Product Details</th>
                    <th className="px-8 py-4 text-right">Quantity Sold</th>
                    <th className="px-8 py-4 text-right">Segment Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {segmentProducts.map(p => (
                    <tr key={p.stockCode} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-sm">{p.description}</p>
                        <p className="text-[10px] font-mono text-gray-400 uppercase">{p.stockCode}</p>
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-sm">{p.quantity.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right font-bold text-sm text-emerald-600">${p.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <motion.div key="customers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-black/5 flex-1 min-w-[200px]">
                  <Search size={14} className="text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Filter by Customer ID..." 
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="bg-transparent text-xs outline-none w-full" 
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-black/5">
                  <Calendar size={14} className="text-gray-400" />
                  <input 
                    type="date" 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent text-xs outline-none" 
                  />
                </div>
                <button 
                  onClick={() => { setCustomerSearch(''); setDateFilter(''); }}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  Reset Filters
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-mono uppercase text-gray-400">
                      <tr>
                        <th className="px-8 py-4">Customer ID</th>
                        <th className="px-8 py-4">Last Purchase</th>
                        <th className="px-8 py-4 text-right">Total Spend</th>
                        <th className="px-8 py-4 text-right">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {filteredCustomers.slice(0, 50).map(c => (
                        <tr key={c.customerId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-6 font-bold text-sm">{c.customerId}</td>
                          <td className="px-8 py-6 text-xs text-gray-400">{new Date(c.lastPurchase).toLocaleDateString()}</td>
                          <td className="px-8 py-6 text-right font-bold text-sm text-emerald-600">${c.totalSpend.toLocaleString()}</td>
                          <td className="px-8 py-6 text-right font-bold text-sm">{c.orderCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-gray-50 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-mono">Showing {Math.min(50, filteredCustomers.length)} of {filteredCustomers.length} results</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-12 rounded-3xl border border-black/5 shadow-sm">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center">
                    <BrainCircuit size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Segment Specific Strategy</h3>
                    <p className="text-sm text-gray-400 uppercase font-mono tracking-widest">AI Generated Insights for {segment.name}</p>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-600 prose-p:italic prose-p:serif prose-li:text-gray-600">
                  <Markdown>
                    {`### Strategic Overview for ${segment.name}\n\nThis segment represents **${Math.round((segment.count / analysis.totalCustomers) * 100)}%** of your active customer base. With an average spend of **$${segment.avgMonetary}**, they are a critical component of your revenue stream.\n\n#### Key Recommendations:\n1. **Personalization**: Leverage their top products like *${segmentProducts[0]?.description || 'their favorites'}* in email campaigns.\n2. **Retention**: Since their average recency is **${segment.avgRecency} days**, target those approaching the ${segment.avgRecency + 30} day mark with special offers.\n3. **Upsell**: Introduce complementary products to their most purchased items to increase the average order value.`}
                  </Markdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const DetailStat = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    violet: 'text-violet-600 bg-violet-50',
    amber: 'text-amber-600 bg-amber-50',
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};

const CharacteristicItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex items-center justify-between py-3 border-b border-black/5 last:border-0">
    <span className="text-xs text-gray-400 uppercase font-mono">{label}</span>
    <span className="text-sm font-bold">{value}</span>
  </div>
);
