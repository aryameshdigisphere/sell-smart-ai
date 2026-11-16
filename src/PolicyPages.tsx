import React from 'react';

const EMAIL = 'aryameshdigisphere@gmail.com';
const LAST_UPDATED = '16 November 2026';

type PageKey = 'about' | 'contact' | 'pricing' | 'terms' | 'privacy' | 'refund' | 'delivery';

const pages: Record<PageKey, { title: string; intro: string }> = {
  about: { title: 'About SELL SMART AI', intro: 'Practical tools to help small businesses plan, manage and market their online selling activities.' },
  contact: { title: 'Contact Us', intro: 'For product questions, account assistance, billing queries or privacy requests, contact our support team.' },
  pricing: { title: 'Pricing', intro: 'Transparent pricing for access to the SELL SMART AI software.' },
  terms: { title: 'Terms and Conditions', intro: 'Please read these terms before purchasing or using SELL SMART AI.' },
  privacy: { title: 'Privacy Policy', intro: 'This policy explains what information may be processed when you visit or use SELL SMART AI.' },
  refund: { title: 'Refund and Cancellation Policy', intro: 'Please review these terms before completing a purchase.' },
  delivery: { title: 'Shipping and Delivery Policy', intro: 'SELL SMART AI is a digital software product. No physical goods are shipped.' },
};

const links: { key: PageKey; label: string }[] = [
  { key: 'about', label: 'About Us' }, { key: 'contact', label: 'Contact Us' }, { key: 'pricing', label: 'Pricing' },
  { key: 'terms', label: 'Terms & Conditions' }, { key: 'privacy', label: 'Privacy Policy' },
  { key: 'refund', label: 'Refund Policy' }, { key: 'delivery', label: 'Delivery Policy' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-7"><h2 className="mb-2 text-lg font-bold text-slate-100">{title}</h2><div className="space-y-3 text-sm leading-7 text-slate-300">{children}</div></section>;
}

export function PolicyPages({ page }: { page: PageKey }) {
  const meta = pages[page];
  return <div className="min-h-screen bg-slate-950 text-slate-100">
    <header className="border-b border-slate-800 bg-slate-950/95">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <a href="/" className="text-lg font-black tracking-wide text-white">SELL SMART <span className="text-emerald-400">AI</span></a>
        <a href="/" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-400">Open app</a>
      </div>
      <nav className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-2 px-5 pb-4 text-xs text-slate-400">
        {links.map(item => <a key={item.key} href={`/${item.key === 'refund' ? 'refund-policy' : item.key === 'delivery' ? 'delivery-policy' : item.key}`} className={page === item.key ? 'text-emerald-400' : 'hover:text-white'}>{item.label}</a>)}
      </nav>
    </header>
    <main className="mx-auto max-w-3xl px-5 py-12">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-emerald-400">SELL SMART AI</p>
      <h1 className="mb-3 text-3xl font-black tracking-tight text-white">{meta.title}</h1>
      <p className="mb-8 text-slate-400">{meta.intro}</p>
      {page === 'about' && <>
        <Section title="What we offer"><p>SELL SMART AI is a browser-based business productivity application designed to support sellers and small businesses with sales and profit calculations, product and inventory records, order tracking, and AI-assisted marketing content.</p><p>The software is intended as a practical planning and productivity aid. It does not replace professional accounting, tax, legal or business advice.</p></Section>
        <Section title="Our approach"><p>We aim to provide useful tools with clear pricing and straightforward digital access. Users are responsible for checking their business data and reviewing AI-generated material before relying on or publishing it.</p></Section>
        <Section title="Contact"><p>For questions, email <a className="text-emerald-400 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p></Section>
      </>}
      {page === 'contact' && <>
        <Section title="Customer support"><p>Email: <a className="text-emerald-400 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a></p><p>Please include your registered email address and, for payment questions, your Razorpay payment or order reference. Do not email passwords, card details, UPI PINs or OTPs.</p></Section>
        <Section title="Support topics"><p>We can assist with product questions, access and login issues, payment confirmation, renewal queries, and requests relating to personal information.</p><p>We aim to respond within 2 business days. Response times may vary during holidays or periods of high volume.</p></Section>
      </>}
      {page === 'pricing' && <>
        <Section title="SELL SMART AI annual access"><div className="rounded-xl border border-emerald-700/60 bg-slate-900 p-5"><p className="text-sm text-slate-400">Initial payment · 12 months</p><p className="my-1 text-3xl font-black text-white">₹50,000 / $540 / C$745 / £395 / A$745</p><p className="text-sm text-slate-300">One-time payment for the first 12-month access period. Choose INR, USD, CAD, GBP or AUD at checkout.</p><div className="my-4 border-t border-slate-700"/><p className="text-sm text-slate-400">Annual renewal</p><p className="my-1 text-2xl font-bold text-white">₹4,000 / $40 / C$60 / £30 / A$60 per year</p><p className="text-sm text-slate-300">Manual renewal payment. No automatic deduction is made.</p></div><p>The price is shown in your chosen currency before you pay. International prices include payment processing fees. Any applicable taxes, if charged, will be shown during checkout or on the invoice.</p></Section>
        <Section title="Renewal and access"><p>We will send a renewal reminder to the customer email address on record approximately 30 days before expiry where that contact information is available. Access expires at the end of the paid period. If renewal is not completed, access may be suspended after expiry. Access is restored or extended for a further 12 months only after the renewal payment is successfully verified.</p></Section>
        <Section title="Purchase"><p>Payment is processed through Razorpay or another payment method expressly presented at checkout. App access is provided after successful server-side payment verification.</p><p>For billing questions, contact <a className="text-emerald-400 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p></Section>
      </>}
      {page === 'terms' && <>
        <Section title="1. Acceptance and eligibility"><p>By accessing, purchasing or using SELL SMART AI, you agree to these Terms and Conditions. If you do not agree, do not use the service. You must be legally capable of entering into a binding agreement under applicable law.</p></Section>
        <Section title="2. Product and access period"><p>SELL SMART AI provides browser-based tools for sales and profit calculations, product and inventory management, order records and AI-assisted content creation. The standard offer displayed on this website is ₹50,000 (or the equivalent in USD, CAD, GBP or AUD shown at checkout) for 12 months of access, followed by a manual annual renewal of ₹4,000 (or the equivalent shown at renewal) for each additional 12-month period.</p><p>Access begins after successful payment verification and any required account setup. Renewal is not automatic. If payment is not received and verified by the end of the current access period, access may be suspended until renewal is completed.</p></Section>
        <Section title="3. Payments"><p>Payments are processed by Razorpay or the payment provider displayed at checkout. We do not ask for or store your card PIN, UPI PIN, CVV or OTP. Payment confirmation is subject to verification by the payment provider and our server-side records.</p></Section>
        <Section title="4. Acceptable use"><p>You must use the service lawfully and must not attempt to disrupt, reverse engineer, gain unauthorized access to, or misuse the service. You are responsible for keeping your account credentials secure and for activity under your account.</p></Section>
        <Section title="5. Your data and generated content"><p>You are responsible for the accuracy, legality and backup of information you enter. AI-generated suggestions may be inaccurate or incomplete; review all outputs, prices, claims and product details before use or publication. Do not submit information that you are not authorized to share.</p></Section>
        <Section title="6. Intellectual property"><p>The software, branding, design and underlying materials are owned by or licensed to the service operator. Your subscription grants a limited, non-exclusive, non-transferable right to use the service during the paid access period. It does not transfer ownership of the software.</p></Section>
        <Section title="7. Availability and liability"><p>We aim to keep the service available but do not guarantee uninterrupted or error-free operation. To the extent permitted by law, the service is provided on an as-available basis. Nothing in these terms excludes rights or liabilities that cannot legally be excluded. You should maintain independent backups of important business records.</p></Section>
        <Section title="8. Suspension and termination"><p>We may suspend or restrict access for non-payment, suspected fraud, security risks, unlawful use or material breach of these terms. Where reasonably practicable, we will provide notice and an opportunity to resolve the issue.</p></Section>
        <Section title="9. Changes and governing law"><p>We may update these terms when the service or legal requirements change. Updated terms will be published on this page with a revised date. These terms are governed by the laws of India, subject to mandatory consumer protections and the jurisdiction of competent courts.</p></Section>
        <Section title="10. Contact"><p>Questions about these terms: <a className="text-emerald-400 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p></Section>
      </>}
      {page === 'privacy' && <>
        <Section title="1. Information we process"><p>Depending on the features you use, information may include your name and email address, account and authentication details, subscription and payment references, and business information you enter such as products, inventory, orders, calculations and saved content.</p><p>The app stores some workspace information in your browser's local storage. If you use account authentication, authentication information is handled through the configured Supabase service. Payment details are handled by Razorpay or the payment provider; we receive payment status and transaction references rather than your full card or UPI credentials.</p></Section>
        <Section title="2. AI features and third parties"><p>When you request AI content generation, the relevant prompt and product details you submit may be sent to Google Gemini through our server to generate a response. Do not include sensitive personal information or confidential customer information in prompts unless you have an appropriate lawful basis and authorization.</p><p>We may rely on service providers for hosting, authentication, payment processing, AI generation, security and technical support. Those providers process information under their own terms and privacy practices.</p></Section>
        <Section title="3. Purposes and legal basis"><p>Information is used to provide and secure the service, create and manage accounts, verify payments, administer subscriptions and renewals, respond to support requests, maintain service performance, prevent fraud and comply with legal obligations. Where required, we rely on consent or another lawful basis under applicable data protection law.</p></Section>
        <Section title="4. Storage, retention and security"><p>Some business workspace data remains in the browser on the device where it was entered; clearing browser storage or changing devices may remove or make that data unavailable. Account, payment and support records may be retained for as long as reasonably necessary for the purposes above, legal compliance, dispute resolution and record keeping.</p><p>We use reasonable technical and organizational safeguards, but no online service or transmission can be guaranteed completely secure.</p></Section>
        <Section title="5. International processing"><p>Our hosting and service providers may process information in countries outside your own. Where international transfers occur, we take steps required by applicable data protection laws and provider arrangements.</p></Section>
        <Section title="6. Your choices and rights"><p>Depending on your location and applicable law, you may have rights to request access, correction, deletion, withdrawal of consent, or to raise an objection or grievance. To make a request, email <a className="text-emerald-400 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>. We may need to verify your identity before acting.</p></Section>
        <Section title="7. Children"><p>SELL SMART AI is intended for business users and is not directed to children. Do not use the service if you are not legally permitted to do so.</p></Section>
        <Section title="8. Updates and contact"><p>We may update this policy as our practices or legal obligations change. Contact <a className="text-emerald-400 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> with privacy questions or requests.</p></Section>
      </>}
      {page === 'refund' && <>
        <Section title="Digital service and cancellation"><p>SELL SMART AI is a digital software service with account-based access. You may choose not to renew at the end of your current 12-month access period. Renewal is manual and no automatic renewal deduction is made.</p></Section>
        <Section title="Refund policy"><p>Except where a refund is required by applicable law, payments for a successfully activated SELL SMART AI subscription are non-refundable once access has been provided.</p><p>We will review refund requests for duplicate payments and payments where the transaction failed but the amount was debited. If our payment records confirm a duplicate or failed transaction, the excess or incorrectly collected amount will be refunded through the original payment method or payment provider's supported process.</p><p>If you believe you have been charged incorrectly, email us with your registered email address, payment date, amount and Razorpay payment reference. Do not send card details, UPI PINs or OTPs.</p></Section>
        <Section title="How to request help"><p>Email <a className="text-emerald-400 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>. We aim to acknowledge billing requests within 2 business days. Approved refunds are initiated through the payment provider; the time taken for the credit to appear depends on the bank or payment method.</p></Section>
        <Section title="Renewal cancellation"><p>Because renewal is manual, you can simply choose not to make the next renewal payment. Your existing access remains available until the paid period expires, unless suspended earlier under the Terms and Conditions.</p></Section>
      </>}
      {page === 'delivery' && <>
        <Section title="Digital delivery"><p>SELL SMART AI is delivered electronically. No physical product, parcel or shipment is involved. After your payment is successfully verified, access instructions or account access will be provided electronically using the email address or account details supplied during purchase.</p></Section>
        <Section title="Delivery time"><p>Access is normally enabled after successful payment verification and completion of any required account setup. Payment confirmation may take additional time if the payment provider reports a pending transaction or requires review. Do not make a second payment while the first transaction is pending; contact support with the payment reference.</p></Section>
        <Section title="Access assistance"><p>If you have paid but cannot access the service, contact <a className="text-emerald-400 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> with your registered email address and payment reference. Never share passwords, OTPs, card CVV or UPI PIN.</p></Section>
        <Section title="Renewals"><p>Renewals are manual. Once the renewal payment is successfully verified, access is extended for a further 12 months. No physical shipping or delivery charge applies.</p></Section>
      </>}
      <p className="mt-10 border-t border-slate-800 pt-5 text-xs text-slate-500">Last updated: {LAST_UPDATED} · Support: <a className="text-emerald-400" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
    </main>
    <footer className="border-t border-slate-800 bg-slate-900/50"><div className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-3 px-5 py-7 text-xs text-slate-400">{links.map(item => <a key={item.key} href={`/${item.key === 'refund' ? 'refund-policy' : item.key === 'delivery' ? 'delivery-policy' : item.key}`} className="hover:text-emerald-400">{item.label}</a>)}<span className="w-full">© {new Date().getFullYear()} SELL SMART AI. All rights reserved.</span></div></footer>
  </div>;
}

export function getPolicyPage(pathname: string): PageKey | null {
  const path = pathname.replace(/\/$/, '') || '/';
  const map: Record<string, PageKey> = { '/about': 'about', '/contact': 'contact', '/pricing': 'pricing', '/terms': 'terms', '/privacy': 'privacy', '/refund-policy': 'refund', '/delivery-policy': 'delivery' };
  return map[path] || null;
}
