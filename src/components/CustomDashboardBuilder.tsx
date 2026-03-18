import React, { useState, useEffect } from 'react';
import { 
  Plus, Save, Trash2, Layout as LayoutIcon, BarChart, PieChart, 
  TrendingUp, Hash, Move, X, Settings, ChevronDown,
  Grid, List, Maximize2, Edit3, Copy, Download, FileJson,
  RefreshCw
} from 'lucide-react';
// @ts-ignore
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { Layout } from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { usePipeline } from '../context/PipelineContext';
import { useAuth } from '../context/AuthContext';
import { db, cleanFirestoreData, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'stat';
  title: string;
  dataSource: string;
  layout: { x: number, y: number, w: number, h: number };
}

interface CustomDashboard {
  id?: string;
  name: string;
  userId: string;
  widgets: Widget[];
  createdAt: any;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const CustomDashboardBuilder: React.FC = () => {
  const { filteredAnalysis: analysis } = usePipeline();
  const { profile, user } = useAuth();
  
  const [dashboards, setDashboards] = useState<CustomDashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<CustomDashboard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboards();
    }
  }, [user]);

  const fetchDashboards = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'dashboards'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomDashboard));
      setDashboards(docs);
      if (docs.length > 0 && !currentDashboard) {
        setCurrentDashboard(docs[0]);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'dashboards');
    }
  };

  const handleCreateDashboard = async () => {
    if (!user) return;
    const name = prompt('Enter dashboard name:');
    if (!name) return;

    const newDashboard: Partial<CustomDashboard> = {
      name,
      widgets: [],
    };

    try {
      const cleanedData = cleanFirestoreData(newDashboard);
      const docRef = await addDoc(collection(db, 'dashboards'), {
        ...cleanedData,
        userId: user.uid,
        createdAt: new Date()
      });
      const created = { ...newDashboard, id: docRef.id, userId: user.uid, createdAt: new Date() } as CustomDashboard;
      setDashboards(prev => [...prev, created]);
      setCurrentDashboard(created);
      setIsEditing(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'dashboards');
    }
  };

  const handleDuplicateDashboard = async () => {
    if (!currentDashboard || !user) return;
    
    const name = prompt('Enter name for duplicated dashboard:', `${currentDashboard.name} (Copy)`);
    if (!name) return;

    const duplicatedDashboard: Partial<CustomDashboard> = {
      name,
      widgets: currentDashboard.widgets.map(w => ({ ...w, id: Math.random().toString(36).substr(2, 9) })),
    };

    try {
      const cleanedData = cleanFirestoreData(duplicatedDashboard);
      const docRef = await addDoc(collection(db, 'dashboards'), {
        ...cleanedData,
        userId: user.uid,
        createdAt: new Date()
      });
      const created = { ...duplicatedDashboard, id: docRef.id, userId: user.uid, createdAt: new Date() } as CustomDashboard;
      setDashboards(prev => [...prev, created]);
      setCurrentDashboard(created);
      setIsEditing(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'dashboards');
    }
  };

  const handleExportDashboard = () => {
    if (!currentDashboard) return;
    
    const dataStr = JSON.stringify(currentDashboard, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${currentDashboard.name.replace(/\s+/g, '_')}_export.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleSaveDashboard = async () => {
    if (!currentDashboard || !currentDashboard.id) return;
    setIsSaving(true);
    const dashboardId = currentDashboard.id;
    try {
      const { id, ...data } = currentDashboard;
      const cleanedData = cleanFirestoreData(data);
      await updateDoc(doc(db, 'dashboards', dashboardId), {
        ...cleanedData,
        updatedAt: new Date()
      });
      setIsEditing(false);
      fetchDashboards();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `dashboards/${dashboardId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameDashboard = async () => {
    if (!currentDashboard || !currentDashboard.id) return;
    const newName = prompt('Enter new dashboard name:', currentDashboard.name);
    if (!newName || newName === currentDashboard.name) return;

    try {
      await updateDoc(doc(db, 'dashboards', currentDashboard.id), {
        name: newName,
        updatedAt: new Date()
      });
      setCurrentDashboard({ ...currentDashboard, name: newName });
      setDashboards(prev => prev.map(d => d.id === currentDashboard.id ? { ...d, name: newName } : d));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `dashboards/${currentDashboard.id}`);
    }
  };

  const handleDeleteDashboard = async () => {
    if (!currentDashboard || !currentDashboard.id) return;
    if (!window.confirm('Are you sure you want to delete this dashboard?')) return;

    await deleteDoc(doc(db, 'dashboards', currentDashboard.id));
    setDashboards(prev => prev.filter(d => d.id !== currentDashboard.id));
    setCurrentDashboard(dashboards.find(d => d.id !== currentDashboard.id) || null);
  };

  const addWidget = (type: Widget['type']) => {
    if (!currentDashboard) return;
    
    const newWidget: Widget = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
      dataSource: 'segments', // Default
      layout: { x: (currentDashboard.widgets.length * 2) % 12, y: Infinity, w: 4, h: 4 }
    };

    setCurrentDashboard({
      ...currentDashboard,
      widgets: [...currentDashboard.widgets, newWidget]
    });
    setShowWidgetModal(false);
  };

  const removeWidget = (id: string) => {
    if (!currentDashboard) return;
    setCurrentDashboard({
      ...currentDashboard,
      widgets: currentDashboard.widgets.filter(w => w.id !== id)
    });
  };

  const onLayoutChange = (layout: any[]) => {
    if (!currentDashboard || !isEditing) return;
    
    const updatedWidgets = currentDashboard.widgets.map(widget => {
      const l = layout.find((item: any) => item.i === widget.id);
      if (l) {
        return {
          ...widget,
          layout: { x: l.x, y: l.y, w: l.w, h: l.h }
        };
      }
      return widget;
    });

    setCurrentDashboard({
      ...currentDashboard,
      widgets: updatedWidgets
    });
  };

  const renderWidgetContent = (widget: Widget) => {
    if (!analysis) return <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">No data</div>;

    // Simplified data mapping
    let data: any[] = [];
    if (widget.dataSource === 'segments') {
      data = analysis.segments.map(s => ({ name: s.name, value: s.revenue, count: s.count }));
    } else if (widget.dataSource === 'frequency') {
      data = analysis.purchaseFrequency;
    }

    switch (widget.type) {
      case 'stat':
        const total = data.reduce((acc, curr) => acc + (curr.value || curr.count || 0), 0);
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-3xl font-bold tracking-tight dark:text-white">{typeof total === 'number' ? total.toLocaleString() : total}</p>
            <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase mt-2">{widget.title}</p>
          </div>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" opacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#141414', color: '#fff' }} itemStyle={{ color: '#fff' }} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#141414', color: '#fff' }} itemStyle={{ color: '#fff' }} />
            </RePieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" opacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#141414', color: '#fff' }} itemStyle={{ color: '#fff' }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-[#141414] p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LayoutIcon size={18} className="text-gray-400 dark:text-gray-500" />
            <select 
              value={currentDashboard?.id || ''}
              onChange={(e) => setCurrentDashboard(dashboards.find(d => d.id === e.target.value) || null)}
              className="bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold outline-none dark:text-white"
            >
              <option value="" disabled>Select Dashboard</option>
              {dashboards.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          {currentDashboard && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10">
              <span className="text-sm font-bold dark:text-white">{currentDashboard.name}</span>
              <button 
                onClick={handleRenameDashboard}
                className="p-1 text-gray-300 dark:text-gray-600 hover:text-black dark:hover:text-white transition-all"
                title="Rename Dashboard"
              >
                <Edit3 size={14} />
              </button>
            </div>
          )}
          <button 
            onClick={handleCreateDashboard}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-all"
            title="New Dashboard"
          >
            <Plus size={18} />
          </button>
          {currentDashboard && isEditing && currentDashboard.widgets.length === 0 && (
            <button 
              onClick={() => {
                const templateWidgets: Widget[] = [
                  { id: 't1', type: 'stat', title: 'Total Revenue', dataSource: 'segments', layout: { x: 0, y: 0, w: 3, h: 2 } },
                  { id: 't2', type: 'pie', title: 'Revenue Share', dataSource: 'segments', layout: { x: 3, y: 0, w: 3, h: 4 } },
                  { id: 't3', type: 'bar', title: 'Segment Performance', dataSource: 'segments', layout: { x: 6, y: 0, w: 6, h: 4 } },
                  { id: 't4', type: 'line', title: 'Frequency Trends', dataSource: 'frequency', layout: { x: 0, y: 2, w: 3, h: 2 } }
                ];
                setCurrentDashboard({ ...currentDashboard, widgets: templateWidgets });
              }}
              className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-all"
            >
              Apply Template
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentDashboard && (
            <>
              {!isEditing && (
                <>
                  <button 
                    onClick={handleDuplicateDashboard}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-all"
                    title="Duplicate Dashboard"
                  >
                    <Copy size={18} />
                  </button>
                  <button 
                    onClick={handleExportDashboard}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-all"
                    title="Export Dashboard"
                  >
                    <Download size={18} />
                  </button>
                </>
              )}
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setShowWidgetModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                  >
                    <Plus size={14} /> Add Widget
                  </button>
                  <button 
                    onClick={handleSaveDashboard}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/10 dark:shadow-white/5"
                  >
                    {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Layout
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                  >
                    <Edit3 size={14} /> Edit Dashboard
                  </button>
                  <button 
                    onClick={handleDeleteDashboard}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Grid Area */}
      <div className="min-h-[600px] bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-dashed border-black/10 dark:border-white/10 p-4 relative transition-colors">
        {currentDashboard ? (
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: currentDashboard.widgets.map(w => ({ i: w.id, ...w.layout })) }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            draggableHandle=".drag-handle"
            onLayoutChange={onLayoutChange}
            isDraggable={isEditing}
            isResizable={isEditing}
          >
            {currentDashboard.widgets.map(widget => (
              <div key={widget.id} className="bg-white dark:bg-[#141414] rounded-2xl border border-black/5 dark:border-white/5 shadow-sm group overflow-hidden flex flex-col transition-colors">
                <div className="p-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                  <div className="flex items-center gap-2">
                    {isEditing && <Move size={14} className="text-gray-300 dark:text-gray-600 drag-handle cursor-move" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 truncate max-w-[100px]">{widget.title}</span>
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-1">
                      <select 
                        value={widget.type}
                        onChange={(e) => {
                          const newType = e.target.value as Widget['type'];
                          setCurrentDashboard({
                            ...currentDashboard,
                            widgets: currentDashboard.widgets.map(w => w.id === widget.id ? { ...w, type: newType } : w)
                          });
                        }}
                        className="text-[8px] bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded px-1 py-0.5 outline-none font-bold uppercase dark:text-white"
                      >
                        <option value="stat">Stat</option>
                        <option value="bar">Bar</option>
                        <option value="pie">Pie</option>
                        <option value="line">Line</option>
                      </select>
                      <button 
                        onClick={() => removeWidget(widget.id)}
                        className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 overflow-hidden">
                  {renderWidgetContent(widget)}
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 flex items-center justify-center mb-6 shadow-sm">
              <Grid size={40} className="text-gray-200 dark:text-gray-700" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">No Custom Dashboards</h3>
            <p className="text-gray-400 dark:text-gray-500 max-w-sm mx-auto mb-8">Create your own personalized dashboard views with drag-and-drop widgets and custom visualizations.</p>
            <button 
              onClick={handleCreateDashboard}
              className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl shadow-black/10 dark:shadow-white/5"
            >
              Create First Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Widget Modal */}
      <AnimatePresence>
        {showWidgetModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWidgetModal(false)}
              className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-[#141414] rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 w-full max-w-md p-8 transition-colors"
            >
              <h3 className="text-2xl font-bold mb-6 dark:text-white">Add Widget</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'stat', icon: <Hash />, label: 'Metric Card' },
                  { id: 'bar', icon: <BarChart />, label: 'Bar Chart' },
                  { id: 'pie', icon: <PieChart />, label: 'Pie Chart' },
                  { id: 'line', icon: <TrendingUp />, label: 'Line Chart' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => addWidget(type.id as any)}
                    className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-black/10 dark:hover:border-white/10 hover:bg-white dark:hover:bg-black transition-all text-left flex flex-col gap-4 group"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform dark:text-white">
                      {type.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white">{type.label}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Visualization</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
