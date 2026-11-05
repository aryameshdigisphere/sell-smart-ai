export type Currency = 'USD' | 'GBP' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // conversion multiplier relative to USD base
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  costPrice: number; // per unit
  sellingPrice: number; // per unit
  createdAt: string;
  notes?: string;
}

export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Complete' | 'Cancelled' | 'Confirmed' | 'Refunded';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  stockDeducted: boolean;
  date: string;
  channel: 'Shopify' | 'Amazon' | 'TikTok Shop' | 'Direct' | 'Manual';
}

export interface CalculatorInput {
  productName?: string;
  sellingPrice: number;
  productCost: number;
  packaging: number;
  sellerPaidShipping: number;
  otherVariableCosts: number;
  percentagePaymentFee: number; // e.g. 2.9%
  fixedFeePerOrder: number; // e.g. 0.30 per order
  unitsPerOrder: number; // e.g. 1, 2
  numberOfOrders: number; // e.g. 100
}

export interface CalculatorOutput {
  totalUnitsSold: number;
  revenue: number;
  productCosts: number; // productCost * totalUnits
  packagingCosts: number; // packaging * totalUnits
  shippingCosts: number; // sellerPaidShipping * totalUnits
  otherCosts: number; // otherVariableCosts * totalUnits
  unitVariableCosts: number;
  totalVariableCosts: number;
  percentageFeeAmount: number;
  fixedFeeAmount: number;
  totalPaymentFees: number;
  totalCosts: number; // totalExpenses
  totalExpenses: number;
  estimatedProfit: number;
  profitMargin: number; // percentage
  unitProfit: number;
  breakEvenPrice: number;
  roi: number; // percentage
}

export interface SavedScenario {
  id: string;
  name: string;
  date: string;
  input: CalculatorInput;
  output: CalculatorOutput;
}

export type ContentTone = 
  | 'Friendly' 
  | 'Professional' 
  | 'Luxury' 
  | 'Playful' 
  | 'Minimalist' 
  | 'Persuasive' 
  | 'Fun' 
  | 'Emotional' 
  | 'Sales-focused';

export type TargetCountry = 'USA' | 'UK' | 'Canada' | 'Australia';

export type SearchIntent = 'transactional' | 'commercial' | 'informational';

export type SocialPlatform = 'Instagram' | 'Facebook' | 'Pinterest';

export interface SEOKeywordsData {
  primaryKeywords: string[]; // 5-10
  longTailKeywords: string[]; // 10-15
  semanticKeywords: string[]; // 5-10
  buyerIntentPhrases: string[];
  suggestedTags: string[];
  marketplaceTags?: string[];
  categoryTags?: string[];
  audienceTags?: string[];
  seasonalTags?: string[];
}

export interface SEOProductListingData {
  seoTitle: string;
  shortDescription: string;
  detailedDescription: string;
  bulletPoints: string[];
  metaTitle: string;
  metaDescription: string;
  urlSlug: string;
  imageAltTexts: string[];
  productTags: string[];
  specifications?: string;
  callToAction?: string;
}

export interface SocialCaptionVariation {
  id: string;
  title: string;
  hook: string;
  body: string;
  callToAction: string;
  postTitle?: string;
  type?: 'promotional' | 'emotional' | 'sales' | 'lifestyle' | 'educational';
}

export interface SocialMediaContentData {
  platform: SocialPlatform;
  variations: SocialCaptionVariation[];
  hashtags: string[];
  suggestedCtas: string[];
  targetKeywordsUsed: string[];
}

export interface PreloadedProductTemplate {
  id: string;
  templateName: string;
  category: string;
  targetAudience: string;
  seoProductTitle: string;
  shortDescription: string;
  detailedDescription: string;
  productHighlights: string[];
  personalisationInstructions?: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  primaryKeywords: string[];
  longTailKeywords: string[];
  semanticKeywordsAndTags: string[];
  instagramCaption1: {
    type: string;
    hook: string;
    body: string;
    callToAction: string;
  };
  instagramCaption2: {
    type: string;
    hook: string;
    body: string;
    callToAction: string;
  };
  hashtags: string[];
  callToAction: string;
  editableFields: Record<string, string>;
}

export interface ComprehensiveSEOResult {
  productListing: SEOProductListingData;
  socialContent: SocialMediaContentData;
  seoKeywords: SEOKeywordsData;
  country: TargetCountry;
  searchIntent: SearchIntent;
  tone: ContentTone;
  generatedAt: string;
}

export interface GeneratedCopyResult {
  productDescription?: {
    headline: string;
    body: string;
    bulletPoints: string[];
    callToAction: string;
  };
  instagramCaption?: {
    hook: string;
    body: string;
    callToAction: string;
    hashtags: string[];
  };
  seoResult?: ComprehensiveSEOResult;
}

export interface SavedCopy {
  id: string;
  productName: string;
  category: string;
  tone: ContentTone;
  country?: TargetCountry;
  intent?: SearchIntent;
  content: ComprehensiveSEOResult | GeneratedCopyResult;
  createdAt: string;
  tags?: string[];
}

export interface ContentGenerationHistoryItem {
  id: string;
  productName: string;
  category: string;
  country: TargetCountry;
  intent: SearchIntent;
  tone: ContentTone;
  createdAt: string;
  data: ComprehensiveSEOResult;
}
