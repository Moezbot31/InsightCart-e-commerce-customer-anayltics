import { Transaction, RFMMetrics, CustomerSegment, ProductMetric, AnalysisResult } from '../types';

export interface CustomerDetail {
  customerId: string;
  lastPurchase: string;
  totalSpend: number;
  orderCount: number;
  segment: string;
}

export function performRFMAnalysis(transactions: Transaction[]): Omit<AnalysisResult, 'timestamp' | 'aiInsights' | 'pipelineConfig' | 'rawData'> {
  const now = new Date();
  const customerData: Record<string, { lastDate: Date; count: number; total: number; country: string }> = {};
  const productData: Record<string, { description: string, quantity: number, revenue: number, category?: string, subcategory?: string }> = {};
  const invoiceData = new Set<string>();
  
  const salesByMonth: Record<string, number> = {};
  const revenueByCountryMap: Record<string, number> = {};

  const categoryMap: Record<string, number> = {};
  
  // 1. Calculate RFM, Product Metrics, and Trends
  transactions.forEach((t) => {
    const date = new Date(t.invoiceDate);
    const amount = t.quantity * t.unitPrice;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    invoiceData.add(t.invoiceNo);
    
    // Sales Trend
    salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + amount;
    
    // Revenue by Country
    revenueByCountryMap[t.country] = (revenueByCountryMap[t.country] || 0) + amount;

    // Category Data
    if (t.category) {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + amount;
    }

    // Customer RFM
    if (!customerData[t.customerId]) {
      customerData[t.customerId] = { lastDate: date, count: 1, total: amount, country: t.country };
    } else {
      if (date > customerData[t.customerId].lastDate) {
        customerData[t.customerId].lastDate = date;
      }
      customerData[t.customerId].count += 1;
      customerData[t.customerId].total += amount;
    }

    // Product Stats
    if (!productData[t.stockCode]) {
      productData[t.stockCode] = { description: t.description, quantity: t.quantity, revenue: amount, category: t.category, subcategory: t.subcategory };
    } else {
      productData[t.stockCode].quantity += t.quantity;
      productData[t.stockCode].revenue += amount;
    }
  });

  const totalRevenue = Object.values(salesByMonth).reduce((a, b) => a + b, 0);
  const totalOrders = invoiceData.size;
  const totalCustomers = Object.keys(customerData).length;

  const topProducts: ProductMetric[] = Object.entries(productData)
    .map(([code, data]) => ({
      stockCode: code,
      description: data.description,
      totalQuantity: data.quantity,
      totalRevenue: data.revenue,
      category: data.category,
      subcategory: data.subcategory
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 50); // Increased to allow local filtering

  const rfmList: RFMMetrics[] = Object.entries(customerData).map(([id, data]) => ({
    customerId: id,
    recency: Math.floor((now.getTime() - data.lastDate.getTime()) / (1000 * 60 * 60 * 24)),
    frequency: data.count,
    monetary: data.total,
  }));

  const segments: Record<string, CustomerSegment> = {
    champions: {
      id: 'champions',
      name: 'Champions',
      description: 'Bought recently, buy often and spend the most!',
      count: 0,
      avgRecency: 0,
      avgFrequency: 0,
      avgMonetary: 0,
      revenue: 0,
      color: '#10b981',
      customerIds: [],
    },
    loyal: {
      id: 'loyal',
      name: 'Loyal Customers',
      description: 'Spend good money and respond to promotions.',
      count: 0,
      avgRecency: 0,
      avgFrequency: 0,
      avgMonetary: 0,
      revenue: 0,
      color: '#3b82f6',
      customerIds: [],
    },
    at_risk: {
      id: 'at_risk',
      name: 'At Risk',
      description: 'Spent big money and purchased often. But long time ago.',
      count: 0,
      avgRecency: 0,
      avgFrequency: 0,
      avgMonetary: 0,
      revenue: 0,
      color: '#f59e0b',
      customerIds: [],
    },
    hibernating: {
      id: 'hibernating',
      name: 'Hibernating',
      description: 'Last purchase was long ago and low number of orders.',
      count: 0,
      avgRecency: 0,
      avgFrequency: 0,
      avgMonetary: 0,
      revenue: 0,
      color: '#ef4444',
      customerIds: [],
    },
    others: {
      id: 'others',
      name: 'Promising',
      description: 'Recent shoppers, but haven’t spent much.',
      count: 0,
      avgRecency: 0,
      avgFrequency: 0,
      avgMonetary: 0,
      revenue: 0,
      color: '#8b5cf6',
      customerIds: [],
    },
  };

  const customerDetails: CustomerDetail[] = [];
  const scatterData: { recency: number; frequency: number; monetary: number; segment: string; color: string }[] = [];

  rfmList.forEach((rfm) => {
    let segmentKey = 'others';

    if (rfm.recency < 30 && rfm.frequency > 15 && rfm.monetary > 500) {
      segmentKey = 'champions';
    } else if (rfm.frequency > 10 && rfm.monetary > 300) {
      segmentKey = 'loyal';
    } else if (rfm.recency > 180 && rfm.monetary > 400) {
      segmentKey = 'at_risk';
    } else if (rfm.recency > 250) {
      segmentKey = 'hibernating';
    }

    const seg = segments[segmentKey];
    seg.count += 1;
    seg.avgRecency += rfm.recency;
    seg.avgFrequency += rfm.frequency;
    seg.avgMonetary += rfm.monetary;
    seg.revenue += rfm.monetary;
    seg.customerIds.push(rfm.customerId);

    customerDetails.push({
      customerId: rfm.customerId,
      lastPurchase: customerData[rfm.customerId].lastDate.toISOString(),
      totalSpend: rfm.monetary,
      orderCount: rfm.frequency,
      segment: seg.name
    });

    scatterData.push({
      recency: rfm.recency,
      frequency: rfm.frequency,
      monetary: rfm.monetary,
      segment: seg.name,
      color: seg.color
    });
  });

  // Finalize averages
  const finalizedSegments = Object.values(segments).map((s) => ({
    ...s,
    avgRecency: s.count > 0 ? Math.round(s.avgRecency / s.count) : 0,
    avgFrequency: s.count > 0 ? Math.round(s.avgFrequency / s.count) : 0,
    avgMonetary: s.count > 0 ? Math.round(s.avgMonetary / s.count) : 0,
  }));

  // Sales Trend Array
  const salesTrend = Object.entries(salesByMonth)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Revenue by Country Array
  const revenueByCountry = Object.entries(revenueByCountryMap)
    .map(([country, revenue]) => ({ country, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  // Purchase Frequency
  const freqMap: Record<string, number> = {
    '1': 0, '2-5': 0, '6-10': 0, '11-20': 0, '21+': 0
  };
  rfmList.forEach(r => {
    if (r.frequency === 1) freqMap['1']++;
    else if (r.frequency <= 5) freqMap['2-5']++;
    else if (r.frequency <= 10) freqMap['6-10']++;
    else if (r.frequency <= 20) freqMap['11-20']++;
    else freqMap['21+']++;
  });
  const purchaseFrequency = Object.entries(freqMap)
    .map(([range, count]) => ({ range, count }));

  // Repeat vs New
  const repeatCount = rfmList.filter(r => r.frequency > 1).length;
  const repeatVsNew = [
    { type: 'Repeat', count: repeatCount },
    { type: 'New', count: totalCustomers - repeatCount }
  ];

  // Forecast (Simple linear projection)
  const lastRevenue = salesTrend[salesTrend.length - 1]?.revenue || 0;
  const forecastData = [
    ...salesTrend.map(s => ({ ...s, isForecast: false })),
    { date: 'Next Month', revenue: lastRevenue * 1.05, isForecast: true },
    { date: 'In 2 Months', revenue: lastRevenue * 1.1, isForecast: true }
  ];

  // Churn Risk
  const churnRiskData = [
    { risk: 'High', customers: rfmList.filter(r => r.recency > 180).length },
    { risk: 'Medium', customers: rfmList.filter(r => r.recency > 90 && r.recency <= 180).length },
    { risk: 'Low', customers: rfmList.filter(r => r.recency <= 90).length }
  ];

  return {
    totalCustomers,
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    avgCLV: totalCustomers > 0 ? totalRevenue / totalCustomers : 0,
    segments: finalizedSegments,
    topProducts,
    customerDetails,
    salesTrend,
    revenueByCountry,
    purchaseFrequency,
    repeatVsNew,
    scatterData,
    productTrends: salesTrend.map(s => ({ date: s.date, orders: Math.round(s.revenue / 50) })), // Mock orders
    categoryData: Object.entries(categoryMap)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue),
    forecastData,
    churnRiskData
  };
}
