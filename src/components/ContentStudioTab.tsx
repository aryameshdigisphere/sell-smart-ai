import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Package, 
  RotateCcw, 
  Bookmark, 
  Trash2, 
  Hash, 
  Instagram, 
  Facebook, 
  Pin as PinterestIcon, 
  FileText, 
  Heart, 
  Briefcase, 
  Smile, 
  Crown, 
  Globe, 
  Search, 
  Download, 
  CheckCircle2, 
  History, 
  Layers, 
  ArrowRight, 
  Tag, 
  Key, 
  Compass, 
  AlertCircle, 
  HelpCircle, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Sliders, 
  Wand2, 
  X,
  ExternalLink,
  Share2,
  Edit3
} from 'lucide-react';
import { 
  Product, 
  ContentTone, 
  TargetCountry, 
  SearchIntent, 
  SocialPlatform, 
  ComprehensiveSEOResult, 
  SavedCopy, 
  ContentGenerationHistoryItem,
  PreloadedProductTemplate
} from '../types';
import { generateSmartTemplates } from '../utils/contentTemplates';
import { exportSeoSuiteToCSV } from '../utils/csvExport';
import { PRELOADED_TEMPLATES } from '../utils/preloadedTemplates';

interface ContentStudioTabProps {
  products: Product[];
  savedCopyList: SavedCopy[];
  onSaveCopy: (copy: SavedCopy) => void;
  onDeleteSavedCopy: (id: string) => void;
  initialProduct?: Product | null;
}

export const ContentStudioTab: React.FC<ContentStudioTabProps> = ({
  products,
  savedCopyList,
  onSaveCopy,
  onDeleteSavedCopy,
  initialProduct,
}) => {
  // Input fields
  const [productName, setProductName] = useState(
    initialProduct ? initialProduct.name : 'Ceramic Matte Travel Mug (16oz)'
  );
  const [productCategory, setProductCategory] = useState(
    initialProduct ? initialProduct.category : 'Kitchen & Drinkware'
  );
  const [keyFeatures, setKeyFeatures] = useState(
    initialProduct?.notes ||
      'Double-wall vacuum insulation, 100% leak-proof lid, ergonomic ceramic coating, keeps hot 8hrs / cold 24hrs'
  );
  const [targetAudience, setTargetAudience] = useState(
    'Urban commuters, specialty coffee drinkers, and busy professionals'
  );
  const [targetCountry, setTargetCountry] = useState<TargetCountry>('USA');
  const [seedKeywords, setSeedKeywords] = useState('travel mug, ceramic coffee tumbler, leakproof insulated cup');
  const [searchIntent, setSearchIntent] = useState<SearchIntent>('transactional');
  const [tone, setTone] = useState<ContentTone>('Professional');
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('Instagram');

  // Studio Active Tab: 'description' | 'social' | 'keywords' | 'templates'
  const [activeStudioTab, setActiveStudioTab] = useState<'description' | 'social' | 'keywords' | 'templates'>('description');

  // Preloaded Templates State with localStorage persistence
  const [templatesList, setTemplatesList] = useState<PreloadedProductTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('sell_smart_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading custom templates:', e);
    }
    return PRELOADED_TEMPLATES;
  });

  useEffect(() => {
    localStorage.setItem('sell_smart_templates', JSON.stringify(templatesList));
  }, [templatesList]);

  // Edit Template Modal state & expanded template
  const [editingTemplate, setEditingTemplate] = useState<PreloadedProductTemplate | null>(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string>('tpl-pet-ornament');

  // Generation state & Results
  const [isGenerating, setIsGenerating] = useState(false);
  const [engineSource, setEngineSource] = useState<string>('Ready');
  const [currentResult, setCurrentResult] = useState<ComprehensiveSEOResult | null>(null);

  // Copy feedback tracking
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // History state (stored in localStorage)
  const [generationHistory, setGenerationHistory] = useState<ContentGenerationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('sell_smart_content_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading content history:', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sell_smart_content_history', JSON.stringify(generationHistory));
  }, [generationHistory]);

  // Drawer / Modal toggles
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  // Initialize with smart fallback on first mount
  useEffect(() => {
    const initial = generateSmartTemplates({
      productName,
      productCategory,
      keyFeatures,
      targetAudience,
      targetCountry,
      seedKeywords,
      searchIntent,
      tone,
      platform: socialPlatform,
    });
    setCurrentResult(initial.seoResult);
    setEngineSource('Smart Template Engine (Preloaded)');
  }, []);

  // Update when initialProduct changes from parent
  useEffect(() => {
    if (initialProduct) {
      setProductName(initialProduct.name);
      setProductCategory(initialProduct.category);
      if (initialProduct.notes) {
        setKeyFeatures(initialProduct.notes);
      }
    }
  }, [initialProduct]);

  // Catalog item picker
  const handleCatalogSelect = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setProductName(prod.name);
      setProductCategory(prod.category);
      if (prod.notes) {
        setKeyFeatures(prod.notes);
      }
    }
  };

  // Execute Generation
  const handleGenerate = async () => {
    if (!productName.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productCategory,
          keyFeatures,
          targetAudience,
          targetCountry,
          seedKeywords,
          searchIntent,
          tone,
          platform: socialPlatform,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data && (resData.data.productListing || resData.data.seoKeywords)) {
        const enrichedResult: ComprehensiveSEOResult = {
          productListing: resData.data.productListing || {
            seoTitle: resData.data.productDescription?.headline || productName,
            shortDescription: resData.data.productDescription?.body?.slice(0, 150) || '',
            detailedDescription: resData.data.productDescription?.body || '',
            bulletPoints: resData.data.productDescription?.bulletPoints || [],
            metaTitle: `${productName} | Official Store`,
            metaDescription: resData.data.productDescription?.body?.slice(0, 150) || '',
            urlSlug: `/products/${productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            imageAltTexts: [`${productName} hero view`],
            productTags: [productCategory, 'bestseller'],
          },
          socialContent: resData.data.socialContent || {
            platform: socialPlatform,
            variations: [
              {
                id: 'var-1',
                title: 'Featured Story',
                hook: resData.data.instagramCaption?.hook || 'Check this out!',
                body: resData.data.instagramCaption?.body || '',
                callToAction: resData.data.instagramCaption?.callToAction || 'Tap link in bio',
              },
            ],
            hashtags: resData.data.instagramCaption?.hashtags || [],
            suggestedCtas: ['Tap link in bio to shop'],
            targetKeywordsUsed: [productName],
          },
          seoKeywords: resData.data.seoKeywords || {
            primaryKeywords: [productName, `${productName} ${targetCountry}`],
            longTailKeywords: [`best ${productName} online`],
            semanticKeywords: [`${productCategory} gear`],
            buyerIntentPhrases: [`buy ${productName}`],
            suggestedTags: [productCategory],
          },
          country: targetCountry,
          searchIntent,
          tone,
          generatedAt: new Date().toISOString(),
        };

        setCurrentResult(enrichedResult);
        setEngineSource('Gemini 3.8 Flash (Live AI)');

        // Save to generation history
        const newHistoryItem: ContentGenerationHistoryItem = {
          id: `hist-${Date.now()}`,
          productName,
          category: productCategory,
          country: targetCountry,
          intent: searchIntent,
          tone,
          createdAt: new Date().toISOString(),
          data: enrichedResult,
        };
        setGenerationHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
      } else {
        // Fallback to Smart Template Engine
        fallbackToTemplates();
      }
    } catch (err) {
      console.warn('AI generation route failed or offline. Using built-in fallback:', err);
      fallbackToTemplates();
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackToTemplates = () => {
    const templateOutput = generateSmartTemplates({
      productName,
      productCategory,
      keyFeatures,
      targetAudience,
      targetCountry,
      seedKeywords,
      searchIntent,
      tone,
      platform: socialPlatform,
    });
    setCurrentResult(templateOutput.seoResult);
    setEngineSource('Smart Template Engine (Built-in Fallback)');

    const newHistoryItem: ContentGenerationHistoryItem = {
      id: `hist-${Date.now()}`,
      productName,
      category: productCategory,
      country: targetCountry,
      intent: searchIntent,
      tone,
      createdAt: new Date().toISOString(),
      data: templateOutput.seoResult,
    };
    setGenerationHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
  };

  // Clipboard copy helper
  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => {
      setCopiedSection((cur) => (cur === sectionId ? null : cur));
    }, 2000);
  };

  // Copy All for current active tab
  const handleCopyCurrentTab = () => {
    if (!currentResult) return;

    if (activeStudioTab === 'description') {
      const pl = currentResult.productListing;
      const text = `SEO TITLE:\n${pl.seoTitle}\n\nSHORT DESCRIPTION:\n${pl.shortDescription}\n\nDETAILED DESCRIPTION:\n${pl.detailedDescription}\n\nBULLET POINTS:\n${pl.bulletPoints.map((b) => `• ${b}`).join('\n')}\n\nMETA TITLE (${pl.metaTitle.length} chars):\n${pl.metaTitle}\n\nMETA DESCRIPTION (${pl.metaDescription.length} chars):\n${pl.metaDescription}\n\nURL SLUG:\n${pl.urlSlug}\n\nIMAGE ALT TEXTS:\n${pl.imageAltTexts.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nPRODUCT TAGS:\n${pl.productTags.join(', ')}`;
      handleCopy(text, 'tab-all-desc');
    } else if (activeStudioTab === 'social') {
      const sc = currentResult.socialContent;
      const text = sc.variations
        .map(
          (v, i) =>
            `--- VARIATION ${i + 1} (${v.title}) ---\n${v.hook}\n\n${v.body}\n\n${v.callToAction}\n\nHASHTAGS:\n${sc.hashtags.join(' ')}\n`
        )
        .join('\n');
      handleCopy(text, 'tab-all-social');
    } else if (activeStudioTab === 'keywords') {
      const kw = currentResult.seoKeywords;
      const text = `PRIMARY KEYWORDS:\n${kw.primaryKeywords.join('\n')}\n\nLONG-TAIL KEYWORDS:\n${kw.longTailKeywords.join('\n')}\n\nSEMANTIC / LSI KEYWORDS:\n${kw.semanticKeywords.join('\n')}\n\nBUYER-INTENT PHRASES:\n${kw.buyerIntentPhrases.join('\n')}\n\nSUGGESTED TAGS:\n${kw.suggestedTags.join(', ')}`;
      handleCopy(text, 'tab-all-kw');
    }
  };

  // Save current suite to Content Library
  const handleSaveToLibrary = () => {
    if (!currentResult) return;
    const newSave: SavedCopy = {
      id: `copy-${Date.now()}`,
      productName: productName.trim() || 'Untitled Product',
      category: productCategory.trim() || 'General',
      tone,
      country: targetCountry,
      intent: searchIntent,
      content: currentResult,
      createdAt: new Date().toISOString(),
    };
    onSaveCopy(newSave);
    handleCopy('saved', 'save-library-action');
  };

  // Export current suite to CSV
  const handleExportCSV = () => {
    if (!currentResult) return;
    exportSeoSuiteToCSV(currentResult, productName);
  };

  // Preloaded template action handlers
  const handleUseTemplate = (t: PreloadedProductTemplate) => {
    setProductName(t.templateName);
    setProductCategory(t.category);
    setKeyFeatures(t.productHighlights.join('. '));
    setTargetAudience(t.targetAudience);
    setSeedKeywords(t.primaryKeywords.slice(0, 3).join(', '));
    
    const mappedResult: ComprehensiveSEOResult = {
      productListing: {
        seoTitle: t.seoProductTitle,
        shortDescription: t.shortDescription,
        detailedDescription: t.detailedDescription,
        bulletPoints: t.productHighlights,
        metaTitle: t.seoMetaTitle,
        metaDescription: t.seoMetaDescription,
        urlSlug: `/products/${t.templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        imageAltTexts: [`${t.templateName} display hero`],
        productTags: t.semanticKeywordsAndTags.slice(0, 6),
        callToAction: t.callToAction,
      },
      socialContent: {
        platform: 'Instagram',
        variations: [
          {
            id: 'tpl-v1',
            title: t.instagramCaption1.type,
            hook: t.instagramCaption1.hook,
            body: t.instagramCaption1.body,
            callToAction: t.instagramCaption1.callToAction,
          },
          {
            id: 'tpl-v2',
            title: t.instagramCaption2.type,
            hook: t.instagramCaption2.hook,
            body: t.instagramCaption2.body,
            callToAction: t.instagramCaption2.callToAction,
          },
        ],
        hashtags: t.hashtags,
        suggestedCtas: [t.callToAction, t.instagramCaption1.callToAction, t.instagramCaption2.callToAction],
        targetKeywordsUsed: t.primaryKeywords,
      },
      seoKeywords: {
        primaryKeywords: t.primaryKeywords,
        longTailKeywords: t.longTailKeywords,
        semanticKeywords: t.semanticKeywordsAndTags.slice(0, 8),
        buyerIntentPhrases: t.primaryKeywords.map((k) => `buy ${k}`),
        suggestedTags: t.hashtags.map((h) => h.replace('#', '')),
      },
      country: targetCountry,
      searchIntent,
      tone: 'Friendly',
      generatedAt: new Date().toISOString(),
    };

    setCurrentResult(mappedResult);
    setActiveStudioTab('description');
    setCopiedSection('template-applied');
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const handleDuplicateTemplate = (t: PreloadedProductTemplate) => {
    const newTemplate: PreloadedProductTemplate = {
      ...t,
      id: `tpl-${Date.now()}`,
      templateName: `${t.templateName} (Custom Variation)`,
    };
    setTemplatesList((prev) => [newTemplate, ...prev]);
    setExpandedTemplateId(newTemplate.id);
    setCopiedSection(`dup-${t.id}`);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleGenerateFromTemplate = (t: PreloadedProductTemplate) => {
    setProductName(t.templateName);
    setProductCategory(t.category);
    setKeyFeatures(t.productHighlights.join('. '));
    setTargetAudience(t.targetAudience);
    setSeedKeywords(t.primaryKeywords.slice(0, 3).join(', '));
    handleGenerate();
  };

  const handleCopyAllTemplate = (t: PreloadedProductTemplate) => {
    const text = [
      `=== ${t.templateName} ===`,
      `CATEGORY: ${t.category}`,
      `AUDIENCE: ${t.targetAudience}`,
      '',
      `[SEO PRODUCT TITLE]`,
      t.seoProductTitle,
      '',
      `[SHORT DESCRIPTION]`,
      t.shortDescription,
      '',
      `[DETAILED DESCRIPTION]`,
      t.detailedDescription,
      '',
      `[PRODUCT HIGHLIGHTS]`,
      ...t.productHighlights.map((h) => `• ${h}`),
      '',
      t.personalisationInstructions ? `[HOW TO PERSONALISE]\n${t.personalisationInstructions}\n` : '',
      `[META TITLE]`,
      t.seoMetaTitle,
      '',
      `[META DESCRIPTION]`,
      t.seoMetaDescription,
      '',
      `[PRIMARY KEYWORDS]`,
      t.primaryKeywords.join(', '),
      '',
      `[LONG-TAIL KEYWORDS]`,
      t.longTailKeywords.join(', '),
      '',
      `[INSTAGRAM CAPTION 1 - ${t.instagramCaption1.type}]`,
      t.instagramCaption1.hook,
      t.instagramCaption1.body,
      t.instagramCaption1.callToAction,
      '',
      `[INSTAGRAM CAPTION 2 - ${t.instagramCaption2.type}]`,
      t.instagramCaption2.hook,
      t.instagramCaption2.body,
      t.instagramCaption2.callToAction,
      '',
      `[HASHTAGS]`,
      t.hashtags.join(' '),
      '',
      `[CALL TO ACTION]`,
      t.callToAction,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSection(`tpl-copy-${t.id}`);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleSaveTemplateToLibrary = (t: PreloadedProductTemplate) => {
    const mappedResult: ComprehensiveSEOResult = {
      productListing: {
        seoTitle: t.seoProductTitle,
        shortDescription: t.shortDescription,
        detailedDescription: t.detailedDescription,
        bulletPoints: t.productHighlights,
        metaTitle: t.seoMetaTitle,
        metaDescription: t.seoMetaDescription,
        urlSlug: `/products/${t.templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        imageAltTexts: [`${t.templateName} display hero`],
        productTags: t.semanticKeywordsAndTags.slice(0, 6),
        callToAction: t.callToAction,
      },
      socialContent: {
        platform: 'Instagram',
        variations: [
          {
            id: 'tpl-v1',
            title: t.instagramCaption1.type,
            hook: t.instagramCaption1.hook,
            body: t.instagramCaption1.body,
            callToAction: t.instagramCaption1.callToAction,
          },
          {
            id: 'tpl-v2',
            title: t.instagramCaption2.type,
            hook: t.instagramCaption2.hook,
            body: t.instagramCaption2.body,
            callToAction: t.instagramCaption2.callToAction,
          },
        ],
        hashtags: t.hashtags,
        suggestedCtas: [t.callToAction],
        targetKeywordsUsed: t.primaryKeywords,
      },
      seoKeywords: {
        primaryKeywords: t.primaryKeywords,
        longTailKeywords: t.longTailKeywords,
        semanticKeywords: t.semanticKeywordsAndTags,
        buyerIntentPhrases: t.primaryKeywords.map((k) => `buy ${k}`),
        suggestedTags: t.hashtags.map((h) => h.replace('#', '')),
      },
      country: targetCountry,
      searchIntent,
      tone: 'Friendly',
      generatedAt: new Date().toISOString(),
    };

    onSaveCopy({
      id: `save-tpl-${Date.now()}`,
      productName: t.templateName,
      category: t.category,
      tone: 'Friendly',
      country: targetCountry,
      intent: searchIntent,
      content: mappedResult,
      createdAt: new Date().toISOString(),
      tags: ['preloaded-template', t.category],
    });

    setCopiedSection(`tpl-saved-${t.id}`);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleExportTemplateCSV = (t: PreloadedProductTemplate) => {
    const mappedResult = {
      country: targetCountry,
      searchIntent,
      tone: 'Friendly',
      productListing: {
        seoTitle: t.seoProductTitle,
        shortDescription: t.shortDescription,
        detailedDescription: t.detailedDescription,
        bulletPoints: t.productHighlights,
        metaTitle: t.seoMetaTitle,
        metaDescription: t.seoMetaDescription,
        urlSlug: `/products/${t.templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        imageAltTexts: [`${t.templateName} hero`],
        productTags: t.semanticKeywordsAndTags.slice(0, 6),
      },
      seoKeywords: {
        primaryKeywords: t.primaryKeywords,
        longTailKeywords: t.longTailKeywords,
        semanticKeywords: t.semanticKeywordsAndTags,
        buyerIntentPhrases: t.primaryKeywords.map((k) => `buy ${k}`),
        suggestedTags: t.hashtags.map((h) => h.replace('#', '')),
      },
      socialContent: {
        platform: 'Instagram',
        hashtags: t.hashtags,
        suggestedCtas: [t.callToAction],
      },
    };
    exportSeoSuiteToCSV(mappedResult, t.templateName);
  };

  // Countries config
  const countries: { code: TargetCountry; label: string; flag: string }[] = [
    { code: 'USA', label: 'United States', flag: '🇺🇸' },
    { code: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
    { code: 'Canada', label: 'Canada', flag: '🇨🇦' },
    { code: 'Australia', label: 'Australia', flag: '🇦🇺' },
  ];

  // Search intent options
  const intents: { code: SearchIntent; label: string; desc: string }[] = [
    { code: 'transactional', label: 'Transactional', desc: 'Ready to buy & order now' },
    { code: 'commercial', label: 'Commercial', desc: 'Comparing ratings, quality & alternatives' },
    { code: 'informational', label: 'Informational', desc: 'Guides, benefits & how-to discovery' },
  ];

  // Tone options
  const tones: { id: ContentTone; label: string; icon: any }[] = [
    { id: 'Friendly', label: 'Friendly', icon: Heart },
    { id: 'Professional', label: 'Professional', icon: Briefcase },
    { id: 'Playful', label: 'Playful', icon: Smile },
    { id: 'Luxury', label: 'Luxury', icon: Crown },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            SEO & Social Content Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SEO Keyword, Listing & Social Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Synthesize keyword ideas, SEO meta tags, product listings, and platform-tailored social captions for USA, UK, Canada, and Australia.
          </p>
        </div>

        {/* Engine status & History/Library Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Wand2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Engine</span>
              <span className="text-emerald-300 font-bold">{engineSource}</span>
            </div>
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            title="View recent generations"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span>History ({generationHistory.length})</span>
          </button>

          <button
            onClick={() => setShowLibraryModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            title="View saved content library"
          >
            <Bookmark className="h-3.5 w-3.5 text-amber-400" />
            <span>Library ({savedCopyList.length})</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Left Controls (5 cols), Right Studio Tabs (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Comprehensive SEO Brief Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span>Product Brief & Targeting</span>
            </h2>
            {products.length > 0 && (
              <select
                onChange={(e) => handleCatalogSelect(e.target.value)}
                defaultValue=""
                className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="" disabled>Load from Catalog...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900">
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Product Name */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1">Product Title / Name *</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Ceramic Matte Travel Mug (16oz)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Product Category */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1">Product Category</label>
              <input
                type="text"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                placeholder="e.g. Kitchen & Drinkware, Coffee Essentials"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Key Features & Benefits */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1">Product Features & Benefits</label>
              <textarea
                rows={3}
                value={keyFeatures}
                onChange={(e) => setKeyFeatures(e.target.value)}
                placeholder="Enter features separated by commas or lines, e.g. 100% leakproof, 24hr cold, ceramic coated..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Target Customer */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1">Target Customer Persona</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Commuters, eco-conscious coffee lovers"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Target Country Selector */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1.5 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                <span>Target Country</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setTargetCountry(c.code)}
                    className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                      targetCountry === c.code
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700/80'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Seed Keywords */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1 flex items-center gap-1">
                <Key className="h-3.5 w-3.5 text-indigo-400" />
                <span>Seed Keywords (Optional)</span>
              </label>
              <input
                type="text"
                value={seedKeywords}
                onChange={(e) => setSeedKeywords(e.target.value)}
                placeholder="e.g. insulated mug, ceramic tumbler, travel cup"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Comma-separated terms to anchor long-tail and semantic research.</p>
            </div>

            {/* Search Intent */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1.5 flex items-center gap-1">
                <Compass className="h-3.5 w-3.5 text-amber-400" />
                <span>Search Intent</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {intents.map((i) => (
                  <button
                    key={i.code}
                    type="button"
                    onClick={() => setSearchIntent(i.code)}
                    className={`p-2 rounded-xl text-center border transition ${
                      searchIntent === i.code
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700/80'
                    }`}
                  >
                    <span className="font-bold text-xs block">{i.label}</span>
                    <span className="text-[9px] text-slate-400 line-clamp-1 block mt-0.5">{i.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Tone */}
            <div>
              <label className="font-semibold text-slate-200 block mb-1.5">Brand Tone</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {tones.map((t) => {
                  const Icon = t.icon;
                  const isSelected = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700/80'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !productName.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing SEO & Content Suite...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Full SEO & Content Suite</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output Tabs & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Universal Toolbar: Studio Sub-tabs & Export Actions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* 3 Main Studio Tabs */}
            <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
              <button
                onClick={() => setActiveStudioTab('description')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeStudioTab === 'description'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Product Description</span>
              </button>

              <button
                onClick={() => setActiveStudioTab('social')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeStudioTab === 'social'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Instagram className="h-3.5 w-3.5" />
                <span>Social Captions</span>
              </button>

              <button
                onClick={() => setActiveStudioTab('keywords')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeStudioTab === 'keywords'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="h-3.5 w-3.5" />
                <span>SEO Keywords</span>
              </button>

              <button
                onClick={() => setActiveStudioTab('templates')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeStudioTab === 'templates'
                    ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Preloaded Templates ({templatesList.length})</span>
              </button>
            </div>

            {/* Action Buttons: Copy Tab, Export CSV, Save to Library */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleCopyCurrentTab}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                title="Copy all text from current tab"
              >
                {copiedSection?.startsWith('tab-all') ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Tab</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                title="Download complete SEO spreadsheet"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>

              <button
                onClick={handleSaveToLibrary}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
              >
                {copiedSection === 'save-library-action' ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: PRODUCT DESCRIPTION (SEO LISTING GENERATOR) */}
          {activeStudioTab === 'description' && currentResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">SEO Product Listing & Meta Tags</h3>
                </div>
                <span className="text-[11px] text-slate-400">Target: {currentResult.country} • {currentResult.searchIntent}</span>
              </div>

              {/* Field 1: SEO-friendly Product Title */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-300">SEO Product Title</label>
                  <button
                    onClick={() => handleCopy(currentResult.productListing.seoTitle, 'seo-title')}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    {copiedSection === 'seo-title' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSection === 'seo-title' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={currentResult.productListing.seoTitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentResult((prev) => prev ? {
                      ...prev,
                      productListing: { ...prev.productListing, seoTitle: val },
                    } : null);
                  }}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Field 2: Short Description */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-300">Short Product Description (Collection Snippet)</label>
                  <button
                    onClick={() => handleCopy(currentResult.productListing.shortDescription, 'short-desc')}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    {copiedSection === 'short-desc' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSection === 'short-desc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={currentResult.productListing.shortDescription}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentResult((prev) => prev ? {
                      ...prev,
                      productListing: { ...prev.productListing, shortDescription: val },
                    } : null);
                  }}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Field 3: Detailed Product Description */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-300">Detailed Product Description</label>
                  <button
                    onClick={() => handleCopy(currentResult.productListing.detailedDescription, 'detail-desc')}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    {copiedSection === 'detail-desc' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSection === 'detail-desc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={currentResult.productListing.detailedDescription}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentResult((prev) => prev ? {
                      ...prev,
                      productListing: { ...prev.productListing, detailedDescription: val },
                    } : null);
                  }}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Bullet Points */}
              <div>
                <label className="font-semibold text-slate-300 text-xs block mb-1.5">Benefit-Driven Bullet Points</label>
                <div className="space-y-1.5">
                  {currentResult.productListing.bulletPoints.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const updated = [...currentResult.productListing.bulletPoints];
                          updated[idx] = e.target.value;
                          setCurrentResult((prev) => prev ? {
                            ...prev,
                            productListing: { ...prev.productListing, bulletPoints: updated },
                          } : null);
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-800/70 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta Tags Row: Meta Title & Meta Description with Character Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300">Meta Title</span>
                    <span className={`text-[10px] font-bold ${
                      currentResult.productListing.metaTitle.length <= 60 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {currentResult.productListing.metaTitle.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={currentResult.productListing.metaTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurrentResult((prev) => prev ? {
                        ...prev,
                        productListing: { ...prev.productListing, metaTitle: val },
                      } : null);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white font-medium text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300">Meta Description</span>
                    <span className={`text-[10px] font-bold ${
                      currentResult.productListing.metaDescription.length <= 160 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {currentResult.productListing.metaDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={currentResult.productListing.metaDescription}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurrentResult((prev) => prev ? {
                        ...prev,
                        productListing: { ...prev.productListing, metaDescription: val },
                      } : null);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* URL Slug & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="font-semibold text-slate-300 text-xs block mb-1">Suggested URL Slug</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentResult.productListing.urlSlug}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentResult((prev) => prev ? {
                          ...prev,
                          productListing: { ...prev.productListing, urlSlug: val },
                        } : null);
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 text-xs block mb-1">Product Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {currentResult.productListing.productTags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Alt-Text Suggestions */}
              <div className="pt-2 border-t border-slate-800">
                <label className="font-semibold text-slate-300 text-xs block mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-teal-400" />
                  <span>Image Alt-Text Suggestions</span>
                </label>
                <div className="space-y-1.5">
                  {currentResult.productListing.imageAltTexts.map((alt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={alt}
                        onChange={(e) => {
                          const updated = [...currentResult.productListing.imageAltTexts];
                          updated[idx] = e.target.value;
                          setCurrentResult((prev) => prev ? {
                            ...prev,
                            productListing: { ...prev.productListing, imageAltTexts: updated },
                          } : null);
                        }}
                        className="w-full px-2.5 py-1 bg-slate-800/70 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-teal-500"
                      />
                      <button
                        onClick={() => handleCopy(alt, `alt-${idx}`)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy alt text"
                      >
                        {copiedSection === `alt-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL CAPTIONS (MULTI-PLATFORM GENERATOR) */}
          {activeStudioTab === 'social' && currentResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
              {/* Platform Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-indigo-400" />
                    <span>Social Media Content Generator</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">3 strategic caption variations with targeted hooks and CTAs</p>
                </div>

                <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                  {[
                    { id: 'Instagram' as SocialPlatform, label: 'Instagram', icon: Instagram },
                    { id: 'Facebook' as SocialPlatform, label: 'Facebook', icon: Facebook },
                    { id: 'Pinterest' as SocialPlatform, label: 'Pinterest', icon: PinterestIcon },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = socialPlatform === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSocialPlatform(p.id);
                          // Re-render templates for selected platform
                          const regenerated = generateSmartTemplates({
                            productName,
                            productCategory,
                            keyFeatures,
                            targetAudience,
                            targetCountry,
                            seedKeywords,
                            searchIntent,
                            tone,
                            platform: p.id,
                          });
                          setCurrentResult((prev) => prev ? {
                            ...prev,
                            socialContent: regenerated.seoResult.socialContent,
                          } : null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                          isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3 Caption Variations */}
              <div className="space-y-4">
                {currentResult.socialContent.variations.map((variation, index) => {
                  const fullText = `${variation.hook}\n\n${variation.body}\n\n${variation.callToAction}\n\n.\n.\n${currentResult.socialContent.hashtags.join(' ')}`;
                  return (
                    <div
                      key={variation.id || index}
                      className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-[10px]">
                            {index + 1}
                          </span>
                          <span>{variation.title}</span>
                        </span>

                        <button
                          onClick={() => handleCopy(fullText, `var-${index}`)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition"
                        >
                          {copiedSection === `var-${index}` ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Variation</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Hook */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Opening Hook</label>
                        <input
                          type="text"
                          value={variation.hook}
                          onChange={(e) => {
                            const newHook = e.target.value;
                            setCurrentResult((prev) => {
                              if (!prev) return null;
                              const updatedVars = [...prev.socialContent.variations];
                              updatedVars[index] = { ...updatedVars[index], hook: newHook };
                              return { ...prev, socialContent: { ...prev.socialContent, variations: updatedVars } };
                            });
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Body */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Caption Narrative</label>
                        <textarea
                          rows={3}
                          value={variation.body}
                          onChange={(e) => {
                            const newBody = e.target.value;
                            setCurrentResult((prev) => {
                              if (!prev) return null;
                              const updatedVars = [...prev.socialContent.variations];
                              updatedVars[index] = { ...updatedVars[index], body: newBody };
                              return { ...prev, socialContent: { ...prev.socialContent, variations: updatedVars } };
                            });
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      {/* CTA */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Call to Action</label>
                        <input
                          type="text"
                          value={variation.callToAction}
                          onChange={(e) => {
                            const newCta = e.target.value;
                            setCurrentResult((prev) => {
                              if (!prev) return null;
                              const updatedVars = [...prev.socialContent.variations];
                              updatedVars[index] = { ...updatedVars[index], callToAction: newCta };
                              return { ...prev, socialContent: { ...prev.socialContent, variations: updatedVars } };
                            });
                          }}
                          className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-semibold text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hashtag Bundle */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Relevant Hashtag Bundle</span>
                  </label>
                  <button
                    onClick={() => handleCopy(currentResult.socialContent.hashtags.join(' '), 'all-tags')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedSection === 'all-tags' ? 'Copied Tags!' : 'Copy All Tags'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  {currentResult.socialContent.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-700 text-indigo-300 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Call-to-Action Suggestions */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Call-to-Action Recommendations</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentResult.socialContent.suggestedCtas.map((cta, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-300 truncate pr-2">{cta}</span>
                      <button
                        onClick={() => handleCopy(cta, `cta-${idx}`)}
                        className="text-slate-400 hover:text-white shrink-0"
                        title="Copy CTA"
                      >
                        {copiedSection === `cta-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO KEYWORDS (GROUPED & INTENT-ALIGNED) */}
          {activeStudioTab === 'keywords' && currentResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Product SEO Keyword Generator</h3>
                </div>
                <button
                  onClick={handleCopyCurrentTab}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy All Keywords</span>
                </button>
              </div>

              {/* Truth-in-data callout */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400 flex items-start gap-2.5 leading-relaxed">
                <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Ethical SEO Note:</strong> Keywords below are contextual keyword ideas generated via semantic linguistics and search intent modeling. We do not invent simulated search volume figures or unverified ranking scores.
                </span>
              </div>

              {/* Group 1: Primary Keywords (5-10) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Primary Keywords ({currentResult.seoKeywords.primaryKeywords.length})
                  </h4>
                  <span className="text-[10px] text-slate-500">Core ranking anchors</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentResult.seoKeywords.primaryKeywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs hover:border-emerald-500/40 transition"
                    >
                      <span className="font-semibold text-slate-200">{kw}</span>
                      <button
                        onClick={() => handleCopy(kw, `kw-pri-${idx}`)}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedSection === `kw-pri-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 2: Relevant Long-Tail Keywords (10-15) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                    Long-Tail Keywords ({currentResult.seoKeywords.longTailKeywords.length})
                  </h4>
                  <span className="text-[10px] text-slate-500">High-intent specific queries</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentResult.seoKeywords.longTailKeywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs hover:border-teal-500/40 transition"
                    >
                      <span className="text-slate-300 font-medium">{kw}</span>
                      <button
                        onClick={() => handleCopy(kw, `kw-lt-${idx}`)}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedSection === `kw-lt-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 3: Semantic & LSI Keywords (5-10) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Semantic & Related Keywords ({currentResult.seoKeywords.semanticKeywords.length})
                  </h4>
                  <span className="text-[10px] text-slate-500">Contextual search signals</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentResult.seoKeywords.semanticKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      onClick={() => handleCopy(kw, `kw-sem-${idx}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300 text-xs font-medium cursor-pointer hover:border-indigo-400 transition"
                      title="Click to copy"
                    >
                      {copiedSection === `kw-sem-${idx}` ? '✓ Copied' : kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Group 4: Buyer-Intent Phrases */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Buyer-Intent Phrases ({currentResult.seoKeywords.buyerIntentPhrases.length})
                  </h4>
                  <span className="text-[10px] text-slate-500">Purchase-ready phrases</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentResult.seoKeywords.buyerIntentPhrases.map((kw, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs hover:border-amber-500/40 transition"
                    >
                      <span className="text-amber-200 font-semibold">{kw}</span>
                      <button
                        onClick={() => handleCopy(kw, `kw-buy-${idx}`)}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedSection === `kw-buy-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 5: Suggested Product Tags */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Suggested Taxonomy Tags ({currentResult.seoKeywords.suggestedTags.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentResult.seoKeywords.suggestedTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRELOADED PRODUCT TEMPLATES GALLERY */}
          {activeStudioTab === 'templates' && (
            <div className="space-y-5">
              {/* Top Banner Notice */}
              <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-800/40 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Preloaded High-Converting Product Templates</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    3 Built-in Ecommerce Benchmarks
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ready-to-use product listings, Instagram captions, hashtags, and keyword sets optimized for small business and handmade sellers across USA, UK, Canada, and Australia.
                </p>
                {copiedSection === 'template-applied' && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Template loaded into active editor! Check the Product Description, Social Captions, and SEO Keywords tabs.</span>
                  </div>
                )}
              </div>

              {/* Template Cards List */}
              <div className="space-y-4">
                {templatesList.map((tpl) => {
                  const isExpanded = expandedTemplateId === tpl.id;
                  const isCopied = copiedSection === `tpl-copy-${tpl.id}`;
                  const isSaved = copiedSection === `tpl-saved-${tpl.id}`;
                  const isDuplicated = copiedSection === `dup-${tpl.id}`;

                  return (
                    <div
                      key={tpl.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition space-y-4"
                    >
                      {/* Template Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-base font-bold text-white tracking-tight">{tpl.templateName}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/30">
                              {tpl.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            <strong className="text-slate-300 font-medium">Audience:</strong> {tpl.targetAudience}
                          </p>
                        </div>

                        {/* Top primary actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleUseTemplate(tpl)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
                            title="Load this template into the active generation editor"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span>Use This Template</span>
                          </button>
                        </div>
                      </div>

                      {/* 7 Required Actions Toolbar */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-800/60 pb-3 text-xs">
                        <button
                          onClick={() => setEditingTemplate(tpl)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition font-medium"
                          title="Edit template fields"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Edit Template</span>
                        </button>

                        <button
                          onClick={() => handleDuplicateTemplate(tpl)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition font-medium"
                          title="Clone this template"
                        >
                          <Copy className="h-3.5 w-3.5 text-teal-400" />
                          <span>{isDuplicated ? 'Duplicated!' : 'Duplicate'}</span>
                        </button>

                        <button
                          onClick={() => handleGenerateFromTemplate(tpl)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition font-medium"
                          title="Synthesize a new AI variant from this template"
                        >
                          <Wand2 className="h-3.5 w-3.5 text-amber-400" />
                          <span>Generate New Version</span>
                        </button>

                        <button
                          onClick={() => handleCopyAllTemplate(tpl)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition font-medium"
                          title="Copy all template text to clipboard"
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{isCopied ? 'Copied All!' : 'Copy All'}</span>
                        </button>

                        <button
                          onClick={() => handleSaveTemplateToLibrary(tpl)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition font-medium"
                          title="Save to your reusable content library"
                        >
                          {isSaved ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Bookmark className="h-3.5 w-3.5 text-purple-400" />}
                          <span>{isSaved ? 'Saved!' : 'Save to Library'}</span>
                        </button>

                        <button
                          onClick={() => handleExportTemplateCSV(tpl)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition font-medium"
                          title="Download spreadsheet CSV of this template"
                        >
                          <Download className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Export CSV</span>
                        </button>

                        <button
                          onClick={() => setExpandedTemplateId(isExpanded ? '' : tpl.id)}
                          className="ml-auto text-slate-400 hover:text-slate-200 text-xs font-semibold py-1 px-2"
                        >
                          {isExpanded ? 'Collapse View' : 'Expand Full Copy'}
                        </button>
                      </div>

                      {/* Expandable Preview Sections */}
                      {isExpanded && (
                        <div className="space-y-4 pt-1 text-xs">
                          {/* SEO Title */}
                          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-300 uppercase text-[10px]">SEO Product Title</span>
                              <button
                                onClick={() => handleCopy(tpl.seoProductTitle, `tpl-title-${tpl.id}`)}
                                className="text-slate-400 hover:text-white"
                              >
                                {copiedSection === `tpl-title-${tpl.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                            <p className="font-bold text-white text-sm">{tpl.seoProductTitle}</p>
                          </div>

                          {/* Short & Detailed Descriptions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-300 uppercase text-[10px]">Short Description</span>
                                <button
                                  onClick={() => handleCopy(tpl.shortDescription, `tpl-short-${tpl.id}`)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  {copiedSection === `tpl-short-${tpl.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                              <p className="text-slate-300 leading-relaxed">{tpl.shortDescription}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-300 uppercase text-[10px]">Product Highlights</span>
                              </div>
                              <ul className="space-y-1 text-slate-300">
                                {tpl.productHighlights.map((hl, hIdx) => (
                                  <li key={hIdx} className="flex items-start gap-1.5">
                                    <span className="text-emerald-400 font-bold">•</span>
                                    <span>{hl}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Detailed Description */}
                          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-300 uppercase text-[10px]">Detailed Listing Description</span>
                              <button
                                onClick={() => handleCopy(tpl.detailedDescription, `tpl-det-${tpl.id}`)}
                                className="text-slate-400 hover:text-white"
                              >
                                {copiedSection === `tpl-det-${tpl.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                            <div className="whitespace-pre-line text-slate-300 leading-relaxed font-sans">
                              {tpl.detailedDescription}
                            </div>
                          </div>

                          {/* Social Captions 1 & 2 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-indigo-400 uppercase text-[10px]">
                                  Instagram Caption 1 ({tpl.instagramCaption1.type})
                                </span>
                                <button
                                  onClick={() => handleCopy(`${tpl.instagramCaption1.hook}\n\n${tpl.instagramCaption1.body}\n\n${tpl.instagramCaption1.callToAction}`, `tpl-cap1-${tpl.id}`)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  {copiedSection === `tpl-cap1-${tpl.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                              <p className="font-bold text-white">{tpl.instagramCaption1.hook}</p>
                              <p className="whitespace-pre-line text-slate-300 leading-relaxed">{tpl.instagramCaption1.body}</p>
                              <p className="font-semibold text-emerald-400 pt-1">CTA: {tpl.instagramCaption1.callToAction}</p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-teal-400 uppercase text-[10px]">
                                  Instagram Caption 2 ({tpl.instagramCaption2.type})
                                </span>
                                <button
                                  onClick={() => handleCopy(`${tpl.instagramCaption2.hook}\n\n${tpl.instagramCaption2.body}\n\n${tpl.instagramCaption2.callToAction}`, `tpl-cap2-${tpl.id}`)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  {copiedSection === `tpl-cap2-${tpl.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                              <p className="font-bold text-white">{tpl.instagramCaption2.hook}</p>
                              <p className="whitespace-pre-line text-slate-300 leading-relaxed">{tpl.instagramCaption2.body}</p>
                              <p className="font-semibold text-emerald-400 pt-1">CTA: {tpl.instagramCaption2.callToAction}</p>
                            </div>
                          </div>

                          {/* Keywords & Tags Strip */}
                          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                            <span className="font-bold text-amber-400 uppercase text-[10px] block">
                              Target SEO Keywords & Hashtags
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {tpl.primaryKeywords.map((kw, kIdx) => (
                                <span
                                  key={kIdx}
                                  onClick={() => handleCopy(kw, `kw-${tpl.id}-${kIdx}`)}
                                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 cursor-pointer hover:border-emerald-400"
                                  title="Click to copy"
                                >
                                  {copiedSection === `kw-${tpl.id}-${kIdx}` ? '✓ Copied' : kw}
                                </span>
                              ))}
                              {tpl.hashtags.map((ht, hIdx) => (
                                <span
                                  key={hIdx}
                                  className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                >
                                  {ht}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Editable Fields Dictionary */}
                          {tpl.editableFields && Object.keys(tpl.editableFields).length > 0 && (
                            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
                              <span className="font-bold text-slate-400 uppercase text-[10px] block">
                                Customization Variables:
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {Object.entries(tpl.editableFields).map(([k, v]) => (
                                  <div key={k} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                                    <span className="text-slate-400 block text-[10px]">{k}:</span>
                                    <span className="text-slate-200 font-medium truncate block">{v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: EDIT TEMPLATE */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Edit Template: {editingTemplate.templateName}</h3>
              </div>
              <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setTemplatesList((prev) =>
                  prev.map((t) => (t.id === editingTemplate.id ? editingTemplate : t))
                );
                setEditingTemplate(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-200 block mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={editingTemplate.templateName}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, templateName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-200 block mb-1">Category</label>
                  <input
                    type="text"
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-200 block mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={editingTemplate.targetAudience}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">SEO Product Title</label>
                <input
                  type="text"
                  value={editingTemplate.seoProductTitle}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, seoProductTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editingTemplate.shortDescription}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">Detailed Description</label>
                <textarea
                  rows={5}
                  value={editingTemplate.detailedDescription}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, detailedDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-200 block mb-1">Primary Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={editingTemplate.primaryKeywords.join(', ')}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        primaryKeywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-200 block mb-1">Hashtags (space-separated)</label>
                  <input
                    type="text"
                    value={editingTemplate.hashtags.join(' ')}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        hashtags: e.target.value.split(' ').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">Call to Action</label>
                <input
                  type="text"
                  value={editingTemplate.callToAction}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, callToAction: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20"
                >
                  Save Template Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATION HISTORY */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Content Generation History</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {generationHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No past generations recorded yet. Generate copy to populate your history.
              </p>
            ) : (
              <div className="space-y-3">
                {generationHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white">{item.productName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.category} • {item.country} • {item.intent} • {item.tone}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentResult(item.data);
                        setProductName(item.productName);
                        setProductCategory(item.category);
                        setTargetCountry(item.country);
                        setSearchIntent(item.intent);
                        setTone(item.tone);
                        setShowHistoryModal(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shrink-0 transition"
                    >
                      Reload Suite
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SAVED CONTENT LIBRARY */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Saved Content Library</h3>
              </div>
              <button onClick={() => setShowLibraryModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {savedCopyList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                Your content library is empty. Click &quot;Save&quot; on any generated result to bookmark it.
              </p>
            ) : (
              <div className="space-y-3">
                {savedCopyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white">{item.productName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.category} • {item.tone}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Saved {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if ('productListing' in item.content) {
                            setCurrentResult(item.content as ComprehensiveSEOResult);
                          }
                          setProductName(item.productName);
                          setShowLibraryModal(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onDeleteSavedCopy(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        title="Delete from library"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
