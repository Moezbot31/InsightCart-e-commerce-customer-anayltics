import { Transaction } from '../types';

// Generating a large set of mock data to simulate "Big Data"
export const generateMockTransactions = (count: number = 5000): any[] => {
  const transactions: any[] = [];
  const customerIds = Array.from({ length: 500 }, (_, i) => `CUST-${1000 + i}`);
  const categories = ['Home & Kitchen', 'Fashion', 'Electronics', 'Sports', 'Toys', 'Books'];
  const products = [
    { code: '85123A', desc: 'WHITE HANGING HEART T-LIGHT HOLDER', price: 2.55, category: 'Home & Kitchen', subcategory: 'Decor' },
    { code: '71053', desc: 'WHITE METAL LANTERN', price: 3.39, category: 'Home & Kitchen', subcategory: 'Lighting' },
    { code: '84406B', desc: 'CREAM CUPID HEARTS COAT HANGER', price: 2.75, category: 'Home & Kitchen', subcategory: 'Storage' },
    { code: '84029G', desc: 'KNITTED UNION FLAG HOT WATER BOTTLE', price: 3.39, category: 'Fashion', subcategory: 'Accessories' },
    { code: '84029E', desc: 'RED WOOLLY HOTTIE WHITE HEART.', price: 3.39, category: 'Fashion', subcategory: 'Accessories' },
    { code: '22752', desc: 'SET 7 BABUSHKA NESTING BOXES', price: 7.65, category: 'Toys', subcategory: 'Classic' },
    { code: '21730', desc: 'GLASS STAR FROSTED T-LIGHT HOLDER', price: 4.25, category: 'Home & Kitchen', subcategory: 'Decor' },
    { code: 'EL-001', desc: 'WIRELESS MOUSE', price: 25.99, category: 'Electronics', subcategory: 'Peripherals' },
    { code: 'EL-002', desc: 'MECHANICAL KEYBOARD', price: 89.99, category: 'Electronics', subcategory: 'Peripherals' },
    { code: 'SP-001', desc: 'YOGA MAT', price: 19.99, category: 'Sports', subcategory: 'Fitness' },
    { code: 'BK-001', desc: 'DATA SCIENCE HANDBOOK', price: 45.00, category: 'Books', subcategory: 'Technical' },
  ];

  const countries = ['United Kingdom', 'France', 'Germany', 'Spain', 'Netherlands', 'Pakistan', 'USA', 'Canada', 'Australia', 'Japan'];

  const now = new Date();

  for (let i = 0; i < count; i++) {
    const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const daysAgo = Math.floor(Math.random() * 730); // 2 years of data
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    transactions.push({
      invoiceNo: `INV-${536365 + i}`,
      stockCode: product.code,
      description: product.desc,
      quantity,
      invoiceDate: date.toISOString(),
      unitPrice: product.price,
      customerId,
      country: countries[Math.floor(Math.random() * countries.length)],
      category: product.category,
      subcategory: product.subcategory,
    });
  }

  // Add some "Dirty" data to test cleaning
  // 1. Duplicates
  transactions.push(transactions[0]);
  transactions.push(transactions[0]);

  // 2. Missing values
  transactions.push({ invoiceNo: 'ERR-1', customerId: 'CUST-999', invoiceDate: new Date().toISOString() }); 

  // 3. Outliers
  transactions.push({
    invoiceNo: 'OUT-1',
    stockCode: 'GOLD-1',
    description: 'SOLID GOLD STATUE',
    quantity: 1,
    invoiceDate: new Date().toISOString(),
    unitPrice: 99999.99,
    customerId: 'CUST-1001',
    country: 'United Kingdom'
  });

  return transactions;
};
