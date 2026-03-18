import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc, writeBatch, where } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, cleanFirestoreData } from '../firebase';
import { AnalysisResult, Transaction } from '../types';
import { generateMockTransactions } from '../data/mockData';
import { cleanData, CleaningStats } from '../utils/dataCleaner';
import { performRFMAnalysis } from '../utils/rfmAnalysis';
import { getSegmentInsights } from '../services/geminiService';

type PipelineStatus = 'idle' | 'fetching' | 'preprocessing' | 'clustering' | 'ai_insights' | 'completed';
type DataSource = 'mock' | 'csv' | 'sql' | 'api' | 'excel' | 'json' | 'sheets' | 'azure' | 'bigquery' | 'snowflake' | 'salesforce' | 'sap';
type PipelineType = 'standard' | 'aggressive' | 'retention';

interface Filters {
  country: string;
  category: string;
  dateRange: [string, string];
  segment: string;
}

interface PipelineContextType {
  analysis: AnalysisResult | null;
  filteredAnalysis: AnalysisResult | null;
  history: AnalysisResult[];
  loading: boolean;
  status: PipelineStatus;
  error: string | null;
  cleaningStats: CleaningStats | null;
  config: {
    type: PipelineType;
    source: DataSource;
    autoUpdate: boolean;
  };
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setConfig: React.Dispatch<React.SetStateAction<{ type: PipelineType; source: DataSource; autoUpdate: boolean }>>;
  runPipeline: (rawData?: any[], overrides?: { source?: DataSource; type?: PipelineType }) => Promise<void>;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  fetchHistory: () => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const PipelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [filters, setFilters] = useState<Filters>({
    country: 'All',
    category: 'All',
    dateRange: ['', ''],
    segment: 'All'
  });
  
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<PipelineStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cleaningStats, setCleaningStats] = useState<CleaningStats | null>(null);
  const [config, setConfig] = useState<{ type: PipelineType; source: DataSource; autoUpdate: boolean }>({
    type: 'standard',
    source: 'mock',
    autoUpdate: false,
  });

  const fetchHistory = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'analyses'), 
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc'), 
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalysisResult));
      setHistory(docs);
      if (docs.length > 0 && !analysis) {
        setAnalysis(docs[0]);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'analyses');
    }
  }, [analysis]);

  const runPipeline = useCallback(async (rawData?: any[], overrides?: { source?: DataSource; type?: PipelineType }) => {
    setLoading(true);
    setStatus('fetching');
    setError(null);
    setCleaningStats(null);
    
    const activeSource = overrides?.source || config.source;
    const activeType = overrides?.type || config.type;

    try {
      await new Promise(r => setTimeout(r, 200));
      setStatus('preprocessing');
      
      let dataToClean: any[] = [];
      
      if (rawData) {
        dataToClean = rawData;
      } else if (activeSource === 'mock') {
        dataToClean = generateMockTransactions(3000);
      } else {
        // Fetch from backend for SQL, API, Azure, etc.
        setStatus('fetching');
        console.log(`[Pipeline] Fetching data from ${activeSource} via backend...`);
        
        const response = await fetch('/api/fetch-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: activeSource, config: {} })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch from ${activeSource}`);
        }

        dataToClean = await response.json();
        console.log(`[Pipeline] Successfully received ${dataToClean.length} records from backend.`);
      }

      if (dataToClean.length === 0) throw new Error("No data found in source.");

      const { cleanedData, stats } = cleanData(dataToClean);
      setCleaningStats(stats);
      
      if (cleanedData.length === 0) throw new Error("Data cleaning removed all records.");

      await new Promise(r => setTimeout(r, 300));
      setStatus('clustering');
      const analysisResults = performRFMAnalysis(cleanedData);
      
      await new Promise(r => setTimeout(r, 200));
      setStatus('ai_insights');
      const aiInsights = await getSegmentInsights(analysisResults.segments, analysisResults.topProducts);

      const newAnalysis: AnalysisResult = {
        ...analysisResults,
        timestamp: new Date().toISOString(),
        aiInsights,
        pipelineConfig: activeType,
        rawData: cleanedData
      };

      try {
        // Clean data before writing to Firestore to prevent "undefined" errors
        const cleanedDataForFirestore = cleanFirestoreData(newAnalysis);
        
        // Remove rawData from the object sent to Firestore to avoid 1MB limit
        const { rawData: _, ...dataToSave } = cleanedDataForFirestore;
        
        const docRef = await addDoc(collection(db, 'analyses'), {
          ...dataToSave,
          userId: auth.currentUser?.uid,
          createdAt: new Date()
        });
        newAnalysis.id = docRef.id;
      } catch (err) {
        console.error("Firestore save error:", err);
        // We still set the analysis locally even if save fails
      }

      setAnalysis(newAnalysis);
      setStatus('completed');
      fetchHistory();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus('idle');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [config.type, config.source, fetchHistory]);

  const deleteAnalysis = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'analyses', id));
      setHistory(prev => prev.filter(h => h.id !== id));
      if (analysis?.id === id) {
        setAnalysis(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `analyses/${id}`);
    }
  }, [analysis, db]);

  const clearHistory = useCallback(async () => {
    try {
      const q = query(collection(db, 'analyses'));
      const querySnapshot = await getDocs(q);
      
      // Firestore batch limit is 500
      const docs = querySnapshot.docs;
      for (let i = 0; i < docs.length; i += 500) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + 500);
        chunk.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
      
      setHistory([]);
      setAnalysis(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'analyses');
    }
  }, [db]);

  const filteredAnalysis = React.useMemo(() => {
    if (!analysis || !analysis.rawData) return analysis;

    let filteredTransactions = [...analysis.rawData];

    // 1. Filter by Country
    if (filters.country !== 'All') {
      filteredTransactions = filteredTransactions.filter(t => t.country === filters.country);
    }

    // 2. Filter by Category
    if (filters.category !== 'All') {
      filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
    }

    // 3. Filter by Date Range
    if (filters.dateRange[0]) {
      const start = new Date(filters.dateRange[0]);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.invoiceDate) >= start);
    }
    if (filters.dateRange[1]) {
      const end = new Date(filters.dateRange[1]);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.invoiceDate) <= end);
    }

    // If no transactions left after filtering, return a skeleton or null
    if (filteredTransactions.length === 0) {
      return {
        ...analysis,
        totalCustomers: 0,
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        avgCLV: 0,
        segments: [],
        topProducts: [],
        customerDetails: [],
        salesTrend: [],
        revenueByCountry: [],
        purchaseFrequency: [],
        repeatVsNew: [],
        scatterData: [],
        productTrends: [],
        categoryData: [],
        forecastData: [],
        churnRiskData: []
      };
    }

    // Re-run analysis on filtered data
    const newResults = performRFMAnalysis(filteredTransactions);

    // 4. Filter by Segment (Post-analysis)
    if (filters.segment !== 'All') {
      const segment = newResults.segments.find(s => s.name === filters.segment);
      if (segment) {
        // If we filter by segment, we might want to restrict customerDetails and scatterData
        return {
          ...analysis,
          ...newResults,
          customerDetails: newResults.customerDetails.filter(c => c.segment === filters.segment),
          scatterData: newResults.scatterData.filter(d => d.segment === filters.segment),
          rawData: filteredTransactions.filter(t => {
            const cust = newResults.customerDetails.find(c => c.customerId === t.customerId);
            return cust?.segment === filters.segment;
          })
        };
      }
    }

    return {
      ...analysis,
      ...newResults,
      rawData: filteredTransactions
    };
  }, [analysis, filters]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchHistory();
      } else {
        setHistory([]);
        setAnalysis(null);
      }
    });
    return () => unsubscribe();
  }, [fetchHistory]);

  return (
    <PipelineContext.Provider value={{ 
      analysis, filteredAnalysis, history, loading, status, error, cleaningStats, config, filters,
      setFilters, setConfig, runPipeline, setAnalysis, fetchHistory, deleteAnalysis, clearHistory 
    }}>
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipeline = () => {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
};
