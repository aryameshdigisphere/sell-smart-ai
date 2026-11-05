import { Product, Order } from '../types';

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const stringVal = String(val).replace(/"/g, '""');
  return `"${stringVal}"`;
}

function downloadBlob(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProductsToCSV(products: Product[]): void {
  const headers = [
    'SKU',
    'Product Name',
    'Category',
    'In Stock',
    'Low Stock Threshold',
    'Unit Cost (USD)',
    'Selling Price (USD)',
    'Total Stock Cost Value (USD)',
    'Total Stock Retail Value (USD)',
    'Status',
    'Created At',
    'Notes',
  ];

  const rows = products.map((p) => {
    let status = 'In Stock';
    if (p.stock <= 0) status = 'Out of Stock';
    else if (p.stock <= p.lowStockThreshold) status = 'Low Stock';

    const costVal = (p.stock * p.costPrice).toFixed(2);
    const retailVal = (p.stock * p.sellingPrice).toFixed(2);

    return [
      escapeCSV(p.sku),
      escapeCSV(p.name),
      escapeCSV(p.category),
      p.stock,
      p.lowStockThreshold,
      p.costPrice.toFixed(2),
      p.sellingPrice.toFixed(2),
      costVal,
      retailVal,
      escapeCSV(status),
      escapeCSV(p.createdAt),
      escapeCSV(p.notes || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadBlob(csvContent, `sell-smart-products-${dateStr}.csv`);
}

export function exportOrdersToCSV(orders: Order[]): void {
  const headers = [
    'Order Number',
    'Date',
    'Customer Name',
    'Customer Email',
    'Channel',
    'SKU',
    'Product Name',
    'Quantity',
    'Unit Price (USD)',
    'Total Amount (USD)',
    'Status',
    'Stock Deducted',
  ];

  const rows = orders.map((o) => {
    return [
      escapeCSV(o.orderNumber),
      escapeCSV(o.date),
      escapeCSV(o.customerName),
      escapeCSV(o.customerEmail),
      escapeCSV(o.channel),
      escapeCSV(o.sku),
      escapeCSV(o.productName),
      o.quantity,
      o.unitPrice.toFixed(2),
      o.totalAmount.toFixed(2),
      escapeCSV(o.status),
      o.stockDeducted ? 'Yes' : 'No',
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadBlob(csvContent, `sell-smart-orders-${dateStr}.csv`);
}

export function exportSeoSuiteToCSV(seoData: any, productName: string): void {
  const listing = seoData.productListing || {};
  const keywords = seoData.seoKeywords || {};
  const social = seoData.socialContent || {};

  const rows = [
    ['Field', 'Content / Values'],
    ['Product Name', escapeCSV(productName)],
    ['Target Country', escapeCSV(seoData.country || 'USA')],
    ['Search Intent', escapeCSV(seoData.searchIntent || 'transactional')],
    ['Brand Tone', escapeCSV(seoData.tone || 'Professional')],
    ['SEO Product Title', escapeCSV(listing.seoTitle || '')],
    ['Meta Title (< 60 chars)', escapeCSV(listing.metaTitle || '')],
    ['Meta Description (< 160 chars)', escapeCSV(listing.metaDescription || '')],
    ['Suggested URL Slug', escapeCSV(listing.urlSlug || '')],
    ['Short Description', escapeCSV(listing.shortDescription || '')],
    ['Detailed Description', escapeCSV(listing.detailedDescription || '')],
    ['Bullet Points', escapeCSV((listing.bulletPoints || []).join(' | '))],
    ['Primary Keywords', escapeCSV((keywords.primaryKeywords || []).join(', '))],
    ['Long-Tail Keywords', escapeCSV((keywords.longTailKeywords || []).join(', '))],
    ['Semantic / LSI Keywords', escapeCSV((keywords.semanticKeywords || []).join(', '))],
    ['Buyer-Intent Phrases', escapeCSV((keywords.buyerIntentPhrases || []).join(', '))],
    ['Product Taxonomy Tags', escapeCSV((keywords.suggestedTags || []).join(', '))],
    ['Image Alt Texts', escapeCSV((listing.imageAltTexts || []).join(' | '))],
    ['Social Platform', escapeCSV(social.platform || 'Instagram')],
    ['Social Hashtags', escapeCSV((social.hashtags || []).join(' '))],
    ['Social Call to Actions', escapeCSV((social.suggestedCtas || []).join(' | '))],
  ];

  const csvContent = rows.map((r) => r.join(',')).join('\n');
  const safeName = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'product';
  const dateStr = new Date().toISOString().split('T')[0];
  downloadBlob(csvContent, `sell-smart-seo-${safeName}-${dateStr}.csv`);
}

