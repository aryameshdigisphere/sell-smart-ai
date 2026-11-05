import { 
  ContentTone, 
  TargetCountry, 
  SearchIntent, 
  SocialPlatform, 
  ComprehensiveSEOResult, 
  GeneratedCopyResult 
} from '../types';

export interface SmartTemplateParams {
  productName: string;
  productCategory: string;
  keyFeatures: string;
  targetAudience: string;
  targetCountry?: TargetCountry;
  seedKeywords?: string;
  searchIntent?: SearchIntent;
  tone: ContentTone;
  platform?: SocialPlatform;
}

export function generateSmartTemplates({
  productName,
  productCategory,
  keyFeatures,
  targetAudience,
  targetCountry = 'USA',
  seedKeywords = '',
  searchIntent = 'transactional',
  tone,
  platform = 'Instagram',
}: SmartTemplateParams): GeneratedCopyResult & { seoResult: ComprehensiveSEOResult } {
  const cleanName = productName.trim() || 'Signature Product';
  const cleanCategory = productCategory.trim() || 'Lifestyle & Home';
  const cleanAudience = targetAudience.trim() || 'quality-conscious shoppers';
  const slugBase = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Parse features into individual bullet points
  const rawFeatures = keyFeatures
    .split(/[,;\n]/)
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  const features = rawFeatures.length > 0
    ? rawFeatures
    : [
        'Premium ergonomic design with all-day comfort',
        'Engineered from commercial-grade durable materials',
        'Sleek, minimalist aesthetic that complements any modern space',
        'Backed by our 100% satisfaction guarantee',
      ];

  // Country localization helpers
  const countryTerm = {
    USA: 'US',
    UK: 'UK',
    Canada: 'Canada',
    Australia: 'Australia',
  }[targetCountry];

  const shippingNote = {
    USA: 'Fast domestic USA dispatch & delivery',
    UK: 'Express UK dispatch with Royal Mail & DPD',
    Canada: 'Reliable Canada-wide shipping with tracking',
    Australia: 'Fast Australia-wide courier dispatch',
  }[targetCountry];

  // Intent helpers
  const intentPrefix = {
    transactional: ['buy', 'best price for', 'order online', 'where to purchase', 'shop'],
    commercial: ['top rated', 'best quality', 'review of', 'comparison of', 'durable alternative to'],
    informational: ['how to choose', 'benefits of', 'guide to the best', 'what makes a great', 'features of'],
  }[searchIntent];

  // Seed keywords parsing
  const seedList = seedKeywords
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const primarySeed = seedList[0] || cleanName.toLowerCase();

  // 1. GENERATE SEO KEYWORDS (Grouped strictly as requested)
  const primaryKeywords = [
    `${primarySeed}`,
    `${primarySeed} ${countryTerm}`,
    `best ${cleanName.toLowerCase()}`,
    `${cleanCategory.toLowerCase()} ${primarySeed}`,
    `premium ${primarySeed}`,
    `buy ${primarySeed} online`,
    `${primarySeed} for ${cleanAudience.toLowerCase().split(' ')[0] || 'everyone'}`,
  ].slice(0, 8);

  const longTailKeywords = [
    `where to buy ${primarySeed} with fast shipping`,
    `best affordable ${primarySeed} for daily use`,
    `${primarySeed} reviews and ratings ${new Date().getFullYear()}`,
    `high quality ${primarySeed} in ${countryTerm}`,
    `how to care for your ${primarySeed}`,
    `${primarySeed} vs standard alternative`,
    `top rated ${cleanCategory.toLowerCase()} ${primarySeed}`,
    `eco-friendly durable ${primarySeed}`,
    `lightweight compact ${primarySeed} for travel`,
    `ergonomic ${primarySeed} with warranty`,
    `authentic ${primarySeed} official store`,
    `gift ideas: ${primarySeed} for ${cleanAudience.toLowerCase()}`,
  ];

  const semanticKeywords = [
    `${cleanCategory.toLowerCase()} essentials`,
    `durable daily gear`,
    `ergonomic utility products`,
    `modern lifestyle accessories`,
    `long-lasting materials`,
    `direct-to-consumer craft`,
    `practical minimalist design`,
    `customer favorite merchandise`,
  ];

  const buyerIntentPhrases = [
    `${intentPrefix[0]} ${primarySeed} online`,
    `${intentPrefix[1]} ${primarySeed} in ${countryTerm}`,
    `${intentPrefix[2]} ${cleanName.toLowerCase()}`,
    `discount code for ${primarySeed}`,
    `order ${primarySeed} with free shipping`,
    `buy ${primarySeed} direct from manufacturer`,
  ];

  const suggestedTags = [
    primarySeed.replace(/\s+/g, '-'),
    cleanCategory.toLowerCase().replace(/\s+/g, '-'),
    'bestseller',
    'direct-to-consumer',
    'premium-quality',
    'daily-essentials',
    `${countryTerm.toLowerCase()}-shipping`,
    'top-rated',
    'must-have-gear',
    'lifestyle-upgrade',
  ];

  // 2. GENERATE SEO PRODUCT LISTING
  const seoTitle = `${cleanName} — Premium ${cleanCategory} for ${cleanAudience} | Direct`;
  const metaTitle = `${cleanName} | Best ${cleanCategory} in ${countryTerm}`.slice(0, 58);
  const shortDescription = `Experience unmatched durability and elegance with the ${cleanName}. Designed for ${cleanAudience}, featuring ${features[0] || 'premium craftsmanship'}. Order now with ${shippingNote}.`;
  const metaDescription = `Shop the ${cleanName} online. Engineered for ${cleanAudience} with ${features[0] || 'superior durability'}. ${shippingNote}. Order yours today!`.slice(0, 155);
  const urlSlug = `/products/${slugBase}`;

  const imageAltTexts = [
    `${cleanName} hero front view showing durable finish and compact design`,
    `${cleanName} close-up highlight of ${features[0] || 'ergonomic craftsmanship'}`,
    `${cleanName} in-use lifestyle shot for ${cleanAudience}`,
    `${cleanName} packaging and included accessories set on wooden surface`,
  ];

  // Tailor tone for detailed description
  let headline = `Meet Your New Favorite: The ${cleanName}`;
  let introPara = `We crafted the ${cleanName} with one simple mission: to deliver uncompromising quality and dependable performance for ${cleanAudience}.`;
  let ctaSentence = `Order your ${cleanName} today to experience the difference firsthand. ${shippingNote}.`;

  if (tone === 'Luxury') {
    headline = `The Pinnacle of Refinement: The ${cleanName}`;
    introPara = `An uncompromising pursuit of aesthetic distinction and precision craftsmanship. The ${cleanName} represents an elevated benchmark in modern ${cleanCategory.toLowerCase()}, bespoke-crafted for ${cleanAudience}.`;
    ctaSentence = `Indulge in subtle prestige. Secure your allocation of the ${cleanName} today with complimentary white-glove curation.`;
  } else if (tone === 'Playful') {
    headline = `Warning: The ${cleanName} Might Ruin Other Products For You 🚀`;
    introPara = `Let's be real—life is way too short for boring gear. The ${cleanName} is here to shake things up, bringing high-octane performance and unmatched vibes straight to your door.`;
    ctaSentence = `Don't sleep on this drop! Snag your ${cleanName} now before this batch completely vanishes!`;
  } else if (tone === 'Professional') {
    headline = `Engineered for Superior Performance: The ${cleanName}`;
    introPara = `The ${cleanName} provides an enterprise-tested, highly dependable solution for ${cleanAudience}. Every element has been refined to eliminate friction and maximize everyday productivity.`;
    ctaSentence = `Deploy the ${cleanName} into your daily operations today. Backed by manufacturer guarantee and ${shippingNote}.`;
  }

  const detailedDescription = `${introPara}\n\nBuilt to excel where conventional alternatives fall short, it combines ${features[0] || 'thoughtful design'} with durable engineering tested for continuous daily usage. Whether you are at home, in the studio, or on the move, the ${cleanName} delivers reliability you can touch and feel.`;

  // 3. GENERATE SOCIAL MEDIA CONTENT (Instagram, Facebook, Pinterest)
  const sanitizedWords = [
    cleanName.replace(/[^a-zA-Z0-9]/g, ''),
    cleanCategory.replace(/[^a-zA-Z0-9]/g, ''),
    'MustHave',
    'DailyEssentials',
    'ShopSmall',
    'QualityFirst',
    'TrendingNow',
    'EcommerceFinds',
  ].filter(Boolean);
  const hashtags = Array.from(new Set(sanitizedWords)).map((w) => `#${w}`);

  let variations: { id: string; title: string; hook: string; body: string; callToAction: string }[] = [];

  if (platform === 'Pinterest') {
    variations = [
      {
        id: 'var-1',
        title: 'Aesthetic Inspiration & Board Pin',
        hook: `Minimalist ${cleanCategory} Aesthetic: The ${cleanName} ✨📌`,
        body: `Looking for the perfect balance of aesthetic simplicity and daily durability? The ${cleanName} was designed for ${cleanAudience} who love clean spaces, intentional design, and durable craftsmanship.\n\nKey Highlights:\n- ${features[0]}\n- ${features[1] || 'Thoughtful proportions'}\n- Seamless everyday integration`,
        callToAction: `📌 Save this Pin to your Dream Wishlist board and tap the link to shop!`,
      },
      {
        id: 'var-2',
        title: 'Gift Guide & Must-Have Idea',
        hook: `Top-Rated Gift Guide: Why Everyone is Pinning the ${cleanName} 🎁`,
        body: `Stuck on gift ideas for ${cleanAudience}? The ${cleanName} is the ultimate crowd-pleaser. Unboxing is an experience in itself, complete with premium tactile materials and guaranteed longevity.\n\nFits perfectly into any modern lifestyle setup.`,
        callToAction: `👉 Click through to explore full colorways and enjoy ${shippingNote}!`,
      },
      {
        id: 'var-3',
        title: 'Problem-Solver & Daily Routine',
        hook: `How to Upgrade Your Daily Routine in One Simple Step 💡`,
        body: `Tired of flimsy alternatives breaking after a few weeks? Here is why switching to the ${cleanName} makes all the difference:\n✓ ${features[0]}\n✓ Built from heavy-duty durable materials\n✓ Loved by thousands across ${countryTerm}.`,
        callToAction: `Pin for inspiration & click the link to see customer ratings!`,
      },
    ];
  } else if (platform === 'Facebook') {
    variations = [
      {
        id: 'var-1',
        title: 'Community Conversation & Story Hook',
        hook: `Question for everyone who loves good ${cleanCategory.toLowerCase()}: Have you tried the ${cleanName} yet? 💬`,
        body: `We spent months redesigning the ${cleanName} from the ground up because we knew our community deserved better than cheap imitations.\n\nHere is what makes it stand out from the rest:\n🔹 ${features[0]}\n🔹 ${features[1] || 'Engineered for real-world daily wear'}\n🔹 100% money-back guarantee.\n\nWhat is the #1 feature you look for in your everyday essentials? Let us know in the comments below!`,
        callToAction: `👉 Visit our official online store at the link below for free ${shippingNote}.`,
      },
      {
        id: 'var-2',
        title: 'Direct Customer Review & Social Proof',
        hook: `"Honestly the best purchase I made all year." — Verified Customer Review ⭐⭐⭐⭐⭐`,
        body: `Reviews like this make our entire team smile. The ${cleanName} is built specifically for ${cleanAudience} who want gear that lasts.\n\nHighlights:\n• ${features[0]}\n• ${features[1] || 'Effortless to use & clean'}\n• Priority domestic delivery across ${countryTerm}.`,
        callToAction: `Shop our verified bestseller today. Hit &quot;Shop Now&quot; to grab yours!`,
      },
      {
        id: 'var-3',
        title: 'Limited Batch Announcement',
        hook: `Back in stock alert: Our latest batch of the ${cleanName} is officially live! 📦⚡`,
        body: `Our last allocation sold out in less than 72 hours. We just restocked a fresh batch ready for priority shipping to ${countryTerm}.\n\nDon't wait until backorder—treat yourself or someone you love to commercial-grade quality today.`,
        callToAction: `Click the link below to claim yours with fast tracked delivery!`,
      },
    ];
  } else {
    // Default: Instagram
    variations = [
      {
        id: 'var-1',
        title: 'Viral Reel / Feed Story Hook',
        hook: `✨ Stop scrolling: The ${cleanName} is about to become your new daily obsession 💛`,
        body: `If you appreciate practical luxury that actually holds up, you are going to fall in love with this.\n\nDesigned specifically for ${cleanAudience}:\n• ${features[0]}\n• ${features[1] || 'Feels incredible in your hand'}\n• Zero compromises on quality.\n\nDrop a ❤️ below if you need one of these in your life!`,
        callToAction: `👉 Tap the link in our bio to shop the ${cleanName} with ${shippingNote}!`,
      },
      {
        id: 'var-2',
        title: 'Feature & Benefit Breakdown',
        hook: `Why everyone in ${countryTerm} is talking about the ${cleanName} right now 🔥`,
        body: `We took feedback from hundreds of customers and engineered the ultimate solution:\n⚡ ${features[0]}\n⚡ ${features[1] || 'Ultra-durable finish built to last'}\n⚡ Loved by discerning ${cleanAudience} worldwide.\n\nUpgrade your standard of operations today.`,
        callToAction: `🔗 Save this post for later and tap the link in bio to order!`,
      },
      {
        id: 'var-3',
        title: 'Urgency & Limited Release',
        hook: `Warning: This batch is moving fast! ⏳ The ${cleanName} is almost sold out.`,
        body: `Quality like this doesn't stay on the shelves for long. Each piece is crafted from premium materials and packaged with care.\n\nTag someone who loves ${cleanCategory.toLowerCase()} and needs this! 👇`,
        callToAction: `Head over to our bio link now before the current batch is gone for good!`,
      },
    ];
  }

  const suggestedCtas = [
    `Tap the link in bio to order with ${shippingNote}`,
    `Save this post to your board / collection for later reference`,
    `Comment below with your favorite feature`,
    `Click the link to view verified customer photo reviews`,
    `Shop now before our limited edition run sells out`,
  ];

  const targetKeywordsUsed = primaryKeywords.slice(0, 3);

  const comprehensiveResult: ComprehensiveSEOResult = {
    productListing: {
      seoTitle,
      shortDescription,
      detailedDescription,
      bulletPoints: features,
      metaTitle,
      metaDescription,
      urlSlug,
      imageAltTexts,
      productTags: suggestedTags,
    },
    socialContent: {
      platform,
      variations,
      hashtags,
      suggestedCtas,
      targetKeywordsUsed,
    },
    seoKeywords: {
      primaryKeywords,
      longTailKeywords,
      semanticKeywords,
      buyerIntentPhrases,
      suggestedTags,
    },
    country: targetCountry,
    searchIntent,
    tone,
    generatedAt: new Date().toISOString(),
  };

  return {
    productDescription: {
      headline,
      body: detailedDescription,
      bulletPoints: features,
      callToAction: ctaSentence,
    },
    instagramCaption: {
      hook: variations[0].hook,
      body: variations[0].body,
      callToAction: variations[0].callToAction,
      hashtags,
    },
    seoResult: comprehensiveResult,
  };
}
