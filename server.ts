import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI SDK initialized successfully on server.');
  } catch (err) {
    console.error('Failed to initialize Gemini AI SDK:', err);
  }
}

// Check AI status
app.get('/api/ai-status', (_req, res) => {
  res.json({
    available: !!ai,
    model: 'gemini-3.8-flash',
  });
});

// Server-side generate copy route (supports full SEO suite + legacy formats)
app.post('/api/generate-copy', async (req, res) => {
  const { 
    productName, 
    productCategory, 
    keyFeatures, 
    targetAudience, 
    targetCountry = 'USA',
    seedKeywords = '',
    searchIntent = 'transactional',
    tone = 'Professional',
    platform = 'Instagram',
    type = 'both'
  } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  if (!ai) {
    return res.json({
      fallback: true,
      message: 'GEMINI_API_KEY not configured. Falling back to built-in Smart Template Engine.',
    });
  }

  try {
    const prompt = `You are an elite ecommerce SEO director and DTC copywriter.
Generate a comprehensive, high-converting SEO & Content Suite for the following product:
- Product Name: ${productName}
- Category: ${productCategory || 'General Ecommerce'}
- Key Features & Benefits: ${keyFeatures || 'Durable, premium materials, high quality'}
- Target Customer: ${targetAudience || 'Discerning online shoppers'}
- Target Country: ${targetCountry} (Tailor spelling, localized terminology, and buyer phrasing for ${targetCountry})
- Seed Keywords: ${seedKeywords || productName}
- Search Intent: ${searchIntent} (informational, commercial, or transactional)
- Desired Brand Tone: ${tone} (Friendly, Professional, Playful, or Luxury)
- Primary Social Platform: ${platform} (Instagram, Facebook, or Pinterest)

CRITICAL GUIDELINES:
- Naturally incorporate relevant keywords. Avoid keyword stuffing and unsupported claims.
- Do NOT invent fake numerical search volumes or keyword difficulty scores; provide realistic, highly relevant keyword ideas.
- Provide 3 distinct social caption variations tailored for ${platform}:
  1. Variation 1: Hook / Story-Driven
  2. Variation 2: Feature & Value-Driven
  3. Variation 3: Urgency & Direct Response Call-to-Action
- Include meta title strictly under 60 characters and meta description under 160 characters.
- Include 3 to 4 descriptive image alt-text suggestions.

Return ONLY a valid JSON object matching this exact schema:
{
  "seoKeywords": {
    "primaryKeywords": ["5 to 10 high-relevance primary keywords"],
    "longTailKeywords": ["10 to 15 relevant specific long-tail keywords"],
    "semanticKeywords": ["5 to 10 related LSI/semantic keywords"],
    "buyerIntentPhrases": ["5 to 8 commercial or transactional buyer phrases"],
    "suggestedTags": ["8 to 12 product taxonomy tags"]
  },
  "productListing": {
    "seoTitle": "High-converting, keyword-optimized product title",
    "shortDescription": "Punchy 1-2 sentence summary snippet for collection cards and fast reading",
    "detailedDescription": "Engaging, persuasive multi-paragraph description emphasizing benefits over features",
    "bulletPoints": ["Tangible benefit 1 with feature context", "Tangible benefit 2", "Tangible benefit 3", "Tangible benefit 4", "Tangible benefit 5"],
    "metaTitle": "SEO title under 60 chars with primary keyword and brand",
    "metaDescription": "Click-worthy meta description under 160 chars with compelling hook and CTA",
    "urlSlug": "/products/clean-url-slug",
    "imageAltTexts": ["Descriptive alt text for hero product angle", "Alt text for feature close-up", "Alt text for lifestyle in-use", "Alt text for packaging/unboxing"],
    "productTags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
  },
  "socialContent": {
    "platform": "${platform}",
    "variations": [
      {
        "id": "var-1",
        "title": "Story & Lifestyle Hook",
        "hook": "Attention-grabbing opening line with emoji",
        "body": "Engaging narrative tailored to ${platform} audience",
        "callToAction": "Clear save / tap / link call to action"
      },
      {
        "id": "var-2",
        "title": "Feature & Benefit Spotlight",
        "hook": "Problem-solution hook highlighting key value",
        "body": "Bullet-style or punchy breakdown of why it works",
        "callToAction": "Direct purchase CTA"
      },
      {
        "id": "var-3",
        "title": "Urgency & Social Proof",
        "hook": "High-energy announcement or community favorite angle",
        "body": "Persuasive copy highlighting limited stock or customer delight",
        "callToAction": "Final urgency push to shop"
      }
    ],
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"],
    "suggestedCtas": ["Tap link in bio to shop with free shipping", "Save this post for later", "Comment below with your favorite shade", "Claim yours while batch lasts"],
    "targetKeywordsUsed": ["keyword1", "keyword2", "keyword3"]
  },
  "productDescription": {
    "headline": "Punchy benefit headline",
    "body": "2-3 paragraphs description",
    "bulletPoints": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "callToAction": "Call to action sentence"
  },
  "instagramCaption": {
    "hook": "Scroll-stopping first line",
    "body": "Engaging caption text",
    "callToAction": "Tap link in bio to shop",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4"]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite ecommerce SEO director. Always output strictly valid JSON matching the requested structure without markdown formatting or backticks if possible.',
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      // Clean possible markdown code fences
      const cleanJson = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      data: parsedData,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Server error generating copy via Gemini:', error);
    return res.json({
      fallback: true,
      error: error?.message || 'Error executing Gemini API call',
      message: 'Falling back to built-in Smart Template Engine.',
    });
  }
});

// Setup Vite in development or static serve in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SELL SMART AI server running on http://0.0.0.0:${PORT}`);
});
