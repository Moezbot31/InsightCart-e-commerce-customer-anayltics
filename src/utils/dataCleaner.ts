import { Transaction } from '../types';

export interface CleaningStats {
  initialCount: number;
  finalCount: number;
  duplicatesRemoved: number;
  missingValuesHandled: number;
  outliersHandled: number;
  inconsistenciesFixed: number;
}

export function cleanData(data: any[]): { cleanedData: Transaction[], stats: CleaningStats } {
  const stats: CleaningStats = {
    initialCount: data.length,
    finalCount: 0,
    duplicatesRemoved: 0,
    missingValuesHandled: 0,
    outliersHandled: 0,
    inconsistenciesFixed: 0,
  };

  if (!data || data.length === 0) {
    return { cleanedData: [], stats };
  }

  // 1. Remove Duplicates
  const seen = new Set();
  const uniqueData = data.filter(item => {
    const key = JSON.stringify(item);
    if (seen.has(key)) {
      stats.duplicatesRemoved++;
      return false;
    }
    seen.add(key);
    return true;
  });

  // 2. Handle Missing Values & Type Conversion & Inconsistent Data
  const processedData: Transaction[] = [];
  
  uniqueData.forEach(item => {
    // Check for essential fields
    if (!item.customerId || !item.invoiceDate || !item.unitPrice || !item.quantity) {
      stats.missingValuesHandled++;
      return;
    }

    // Standardize Date
    let date: Date;
    try {
      date = new Date(item.invoiceDate);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
    } catch (e) {
      stats.inconsistenciesFixed++;
      // Try to fix common date formats or skip
      return;
    }

    // Standardize Country Typos (Example)
    let country = String(item.country || 'Unknown').trim();
    if (country.toLowerCase() === 'pakstan') {
      country = 'Pakistan';
      stats.inconsistenciesFixed++;
    }

    // Ensure Numeric types
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    if (isNaN(quantity) || isNaN(unitPrice)) {
      stats.missingValuesHandled++;
      return;
    }

    // Filter out negative or zero values if they don't make sense for sales
    if (quantity <= 0 || unitPrice <= 0) {
      stats.inconsistenciesFixed++;
      return;
    }

    processedData.push({
      invoiceNo: String(item.invoiceNo || 'N/A'),
      stockCode: String(item.stockCode || 'N/A'),
      description: String(item.description || 'No Description').trim(),
      quantity,
      invoiceDate: date.toISOString(),
      unitPrice,
      customerId: String(item.customerId),
      country,
      category: String(item.category || 'Uncategorized'),
      subcategory: String(item.subcategory || 'Other'),
    });
  });

  // 3. Outlier Detection (Using IQR for UnitPrice and Quantity)
  const handleOutliers = (arr: Transaction[]) => {
    if (arr.length < 4) return arr;

    const getIQR = (values: number[]) => {
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      return { min: q1 - 1.5 * iqr, max: q3 + 1.5 * iqr };
    };

    const priceBounds = getIQR(arr.map(d => d.unitPrice));
    const qtyBounds = getIQR(arr.map(d => d.quantity));

    return arr.filter(d => {
      const isOutlier = d.unitPrice < priceBounds.min || d.unitPrice > priceBounds.max ||
                        d.quantity < qtyBounds.min || d.quantity > qtyBounds.max;
      if (isOutlier) {
        stats.outliersHandled++;
        return false; // Remove outliers for this analysis
      }
      return true;
    });
  };

  const finalData = handleOutliers(processedData);
  stats.finalCount = finalData.length;

  return { cleanedData: finalData, stats };
}
