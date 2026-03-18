import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import knex from 'knex';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Helper to normalize data to Transaction format
  const normalizeData = (data: any[]): any[] => {
    return data.map(item => ({
      invoiceNo: String(item.invoiceNo || item.InvoiceNo || item.id || 'N/A'),
      stockCode: String(item.stockCode || item.StockCode || item.sku || 'N/A'),
      description: String(item.description || item.Description || item.product_name || 'No Description'),
      quantity: Number(item.quantity || item.Quantity || item.qty || 0),
      invoiceDate: new Date(item.invoiceDate || item.InvoiceDate || item.created_at || item.date || new Date()).toISOString(),
      unitPrice: Number(item.unitPrice || item.UnitPrice || item.price || 0),
      customerId: String(item.customerId || item.CustomerID || item.user_id || 'Unknown'),
      country: String(item.country || item.Country || 'Unknown'),
      category: String(item.category || item.Category || 'Uncategorized'),
      subcategory: String(item.subcategory || item.Subcategory || 'Other'),
    }));
  };

  // Mock data generator for fallback
  const generateMockData = (count: number) => {
    const categories = ['Electronics', 'Home & Garden', 'Fashion', 'Toys', 'Sports'];
    const subcats: any = {
      'Electronics': ['Audio', 'Computers', 'Mobile'],
      'Home & Garden': ['Furniture', 'Decor', 'Kitchen'],
      'Fashion': ['Men', 'Women', 'Accessories'],
      'Toys': ['Educational', 'Board Games', 'Outdoor'],
      'Sports': ['Fitness', 'Team Sports', 'Water Sports']
    };
    const countries = ['United Kingdom', 'USA', 'Germany', 'France', 'Japan'];
    
    return Array.from({ length: count }).map((_, i) => {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      return {
        invoiceNo: `MOCK-${500000 + i}`,
        stockCode: `SKU-${1000 + Math.floor(Math.random() * 500)}`,
        description: `Product ${i + 1}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        invoiceDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString(),
        unitPrice: parseFloat((Math.random() * 100 + 5).toFixed(2)),
        customerId: `CUST-${10000 + Math.floor(Math.random() * 1000)}`,
        country: countries[Math.floor(Math.random() * countries.length)],
        category: cat,
        subcategory: subcats[cat][Math.floor(Math.random() * subcats[cat].length)]
      };
    });
  };

  // API Routes
  app.post('/api/fetch-data', async (req, res) => {
    const { source } = req.body;
    console.log(`[Data Fetch] Attempting to fetch from ${source}...`);

    try {
      let rawData: any[] = [];
      let isFallback = false;

      const hasSqlConfig = process.env.DB_HOST && process.env.DB_USER;
      const hasAzureConfig = process.env.AZURE_DB_HOST && process.env.AZURE_DB_USER;
      const hasApiConfig = process.env.EXTERNAL_API_URL;

      switch (source) {
        case 'sql':
        case 'azure':
        case 'bigquery':
        case 'snowflake':
          if ((source === 'sql' && !hasSqlConfig) || (source === 'azure' && !hasAzureConfig)) {
            console.warn(`[Data Fetch] Missing config for ${source}. Falling back to automatic mock data.`);
            rawData = generateMockData(2000);
            isFallback = true;
          } else {
            const dbConfig = {
              client: source === 'sql' ? (process.env.DB_CLIENT || 'pg') : 
                      source === 'azure' ? 'mssql' : 
                      source === 'snowflake' ? 'snowflake' : 'pg',
              connection: source === 'azure' ? {
                host: process.env.AZURE_DB_HOST,
                user: process.env.AZURE_DB_USER,
                password: process.env.AZURE_DB_PASSWORD,
                database: process.env.AZURE_DB_NAME,
                options: { encrypt: true }
              } : {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: Number(process.env.DB_PORT || 5432)
              }
            };

            const db = knex(dbConfig);
            rawData = await db.select('*').from(process.env.DB_TABLE || 'transactions').limit(5000);
            await db.destroy();
          }
          break;

        case 'api':
          if (!hasApiConfig) {
            console.warn(`[Data Fetch] Missing config for API. Falling back to automatic mock data.`);
            rawData = generateMockData(1500);
            isFallback = true;
          } else {
            const apiResponse = await axios.get(process.env.EXTERNAL_API_URL || '', {
              headers: { 'Authorization': `Bearer ${process.env.EXTERNAL_API_KEY}` }
            });
            rawData = Array.isArray(apiResponse.data) ? apiResponse.data : apiResponse.data.data || [];
          }
          break;

        case 'salesforce':
        case 'sap':
        case 'sheets':
        case 'excel':
        case 'json':
          console.log(`[Data Fetch] ${source} integration requested. Providing automatic demo data.`);
          rawData = generateMockData(1000);
          isFallback = true;
          break;

        default:
          return res.status(400).json({ error: 'Unsupported data source' });
      }

      const normalizedData = normalizeData(rawData);
      console.log(`[Data Fetch] Successfully ${isFallback ? 'generated' : 'fetched'} and normalized ${normalizedData.length} records.`);
      res.json(normalizedData);

    } catch (error: any) {
      console.error(`[Data Fetch Error] ${error.message}`);
      res.status(500).json({ 
        error: 'Failed to fetch data from source', 
        details: error.message,
        source 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
