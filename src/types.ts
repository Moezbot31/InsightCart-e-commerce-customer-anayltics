export interface Transaction {
  invoiceNo: string;
  stockCode: string;
  description: string;
  quantity: number;
  invoiceDate: string;
  unitPrice: number;
  customerId: string;
  country: string;
  category?: string;
  subcategory?: string;
}

export interface ProductMetric {
  stockCode: string;
  description: string;
  totalQuantity: number;
  totalRevenue: number;
  category?: string;
  subcategory?: string;
}

export interface CustomerDetail {
  customerId: string;
  lastPurchase: string;
  totalSpend: number;
  orderCount: number;
  segment: string;
}

export interface RFMMetrics {
  customerId: string;
  recency: number; // Days since last purchase
  frequency: number; // Number of invoices
  monetary: number; // Total spend
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  avgRecency: number;
  avgFrequency: number;
  avgMonetary: number;
  revenue: number; // Added revenue
  color: string;
  customerIds: string[];
}

export interface AnalysisResult {
  id?: string;
  timestamp: string;
  totalCustomers: number;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  avgCLV: number;
  segments: CustomerSegment[];
  topProducts: ProductMetric[];
  customerDetails: CustomerDetail[];
  aiInsights?: string;
  pipelineConfig?: string;
  rawData?: Transaction[];
  
  // New metrics for expanded dashboards
  salesTrend: { date: string; revenue: number }[];
  revenueByCountry: { country: string; revenue: number }[];
  purchaseFrequency: { range: string; count: number }[]; // Changed range
  repeatVsNew: { type: string; count: number }[];
  scatterData: { recency: number; frequency: number; monetary: number; segment: string; color: string }[]; // Changed to full names
  productTrends: { date: string; orders: number }[]; // Changed to orders
  categoryData: { category: string; revenue: number }[];
  forecastData: { date: string; revenue: number; isForecast: boolean }[];
  churnRiskData: { risk: string; customers: number }[]; // Changed to customers
}
