export interface ServiceFeature {
  title: string;
  description: string;
}

export interface ServiceProcess {
  step: string;
  title: string;
  description: string;
}

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  hero: string;
  heroImage: string;
  intro: string;
  description: string;
  features: ServiceFeature[];
  process: ServiceProcess[];
  benefits: string[];
  faqs: { q: string; a: string }[];
  icon: string;
}

export const services: Service[] = [
  {
    slug: "web-development",
    name: "Web Development",
    shortName: "Web Development",
    tagline: "Fast, scalable, conversion-focused websites",
    icon: "💻",
    hero: "Custom Web Development that Powers Your Growth",
    heroImage:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80",
    intro:
      "We design and build lightning-fast, mobile-first websites and web applications engineered for performance, SEO, and conversions.",
    description:
      "From landing pages to full-scale web apps, our development team combines modern frameworks (React, Next.js, TanStack) with clean UI/UX and a rock-solid backend so your site loads fast, ranks higher, and turns visitors into customers.",
    features: [
      { title: "Custom UI/UX", description: "Pixel-perfect designs tailored to your brand identity and audience." },
      { title: "Responsive by Default", description: "Flawless experience on mobile, tablet, and desktop." },
      { title: "SEO-Ready Code", description: "Semantic HTML, fast load times, and Core Web Vitals optimization." },
      { title: "Secure & Scalable", description: "Modern stack, HTTPS, and infrastructure that grows with you." },
      { title: "CMS Integration", description: "Easily manage content without touching code." },
      { title: "Analytics Setup", description: "Track conversions and user behavior from day one." },
    ],
    process: [
      { step: "01", title: "Discovery", description: "We understand your goals, audience, and competitors." },
      { step: "02", title: "Design", description: "Wireframes and prototypes approved before a single line of code." },
      { step: "03", title: "Development", description: "Clean, tested, production-ready code." },
      { step: "04", title: "Launch & Support", description: "Deploy, monitor, and iterate with ongoing support." },
    ],
    benefits: [
      "Up to 3x faster load times vs template sites",
      "Higher Google rankings from day one",
      "Better conversion rates from thoughtful UX",
      "Full ownership of your source code",
    ],
    faqs: [
      { q: "How long does a website take to build?", a: "A typical business site takes 2–4 weeks. Larger web apps take 6–12 weeks depending on scope." },
      { q: "Do you offer maintenance after launch?", a: "Yes — we offer monthly maintenance plans covering updates, backups, security, and content edits." },
      { q: "Will my website be SEO-friendly?", a: "Absolutely. Every site ships with semantic markup, sitemap, meta tags, and Core Web Vitals optimization." },
    ],
  },
  {
    slug: "seo",
    name: "Search Engine Optimization",
    shortName: "SEO",
    tagline: "Rank higher, get found, drive organic growth",
    icon: "📈",
    hero: "SEO That Ranks and Converts",
    heroImage:
      "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1600&q=80",
    intro:
      "We help brands climb Google rankings with white-hat SEO — technical fixes, quality content, and authority backlinks that compound month after month.",
    description:
      "Our SEO service is built on data, not guesses. We audit your site, fix technical issues, optimize on-page content, and build authoritative backlinks so you attract high-intent traffic that actually converts.",
    features: [
      { title: "Technical SEO Audit", description: "Deep-dive audit covering speed, crawlability, indexing, and Core Web Vitals." },
      { title: "Keyword Research", description: "Find low-competition, high-intent keywords your customers search." },
      { title: "On-Page Optimization", description: "Titles, meta, headers, internal links, and content optimization." },
      { title: "Content Strategy", description: "Blog and landing page content that ranks and educates." },
      { title: "Link Building", description: "High-quality backlinks from trusted, relevant domains." },
      { title: "Monthly Reporting", description: "Transparent reports on rankings, traffic, and conversions." },
    ],
    process: [
      { step: "01", title: "Audit", description: "Full technical and content audit of your current site." },
      { step: "02", title: "Strategy", description: "Custom SEO roadmap targeting your best opportunities." },
      { step: "03", title: "Execution", description: "On-page fixes, content publishing, and link building." },
      { step: "04", title: "Scale", description: "Double down on what works and grow organic traffic." },
    ],
    benefits: [
      "Sustained organic traffic growth",
      "Lower customer acquisition cost than paid ads",
      "Higher domain authority over time",
      "Long-term compounding results",
    ],
    faqs: [
      { q: "How long does SEO take to show results?", a: "Typically 2–3 months for initial movement, and 6+ months for significant rankings on competitive keywords." },
      { q: "Do you guarantee #1 rankings?", a: "No ethical SEO agency does. We guarantee best-practice execution and measurable improvement over time." },
      { q: "Do you use paid links or PBNs?", a: "Never. We only use white-hat, editorial links that stay ranked long-term." },
    ],
  },
  {
    slug: "wordpress",
    name: "WordPress Web Design",
    shortName: "WordPress",
    tagline: "Beautiful, fast, easy-to-manage WordPress sites",
    icon: "🌐",
    hero: "WordPress Websites Built for Speed and Conversions",
    heroImage:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Custom WordPress design and development that combines pixel-perfect design, blazing performance, and easy content management.",
    description:
      "We build WordPress sites the right way — no bloated themes, no page-builder mess. Just clean custom themes, essential plugins, and optimized hosting for a site you'll love to manage.",
    features: [
      { title: "Custom Theme Design", description: "Unique, branded designs — never a stock template." },
      { title: "WooCommerce Ready", description: "Full e-commerce setup with payments and shipping." },
      { title: "Elementor / Gutenberg", description: "Easy visual editing without breaking the design." },
      { title: "Speed Optimized", description: "Caching, image compression, and CDN setup." },
      { title: "Security Hardened", description: "SSL, firewall, malware scanning, and daily backups." },
      { title: "Training Included", description: "We teach you how to manage your site with confidence." },
    ],
    process: [
      { step: "01", title: "Brief", description: "Understand your brand, content, and business goals." },
      { step: "02", title: "Design", description: "Custom mockups approved before development." },
      { step: "03", title: "Build", description: "Clean WordPress theme, plugins, and content migration." },
      { step: "04", title: "Handover", description: "Launch, train, and support you post-launch." },
    ],
    benefits: [
      "Own and manage your site independently",
      "Faster than 90% of WordPress sites",
      "SEO-optimized out of the box",
      "Scales from brochure sites to full e-commerce",
    ],
    faqs: [
      { q: "Why WordPress over other builders?", a: "WordPress powers 40%+ of the web, has the biggest plugin ecosystem, and gives you full ownership and flexibility." },
      { q: "Can I edit the site myself?", a: "Yes — we build with editable blocks and provide training so you can update content anytime." },
      { q: "Do you migrate my existing site?", a: "Absolutely. We handle full migrations including content, SEO redirects, and design refresh." },
    ],
  },
  {
    slug: "google-ads",
    name: "Google Ads Manager",
    shortName: "Google Ads",
    tagline: "Instant traffic, qualified leads, measurable ROI",
    icon: "🎯",
    hero: "Google Ads That Deliver Real ROI",
    heroImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Certified Google Ads specialists building high-performing Search, Display, YouTube, and Shopping campaigns that lower cost per lead and maximize your return.",
    description:
      "We manage Google Ads budgets from $500 to $100k+/month. Every campaign is built on rigorous keyword research, tight ad groups, high-quality landing pages, and daily optimization.",
    features: [
      { title: "Search Ads", description: "Capture high-intent buyers searching for your services." },
      { title: "Display & YouTube", description: "Build brand awareness and retarget visitors." },
      { title: "Shopping Ads", description: "Show your products directly in Google search results." },
      { title: "Conversion Tracking", description: "Track every lead, call, and sale with precision." },
      { title: "Landing Page Optimization", description: "Improve conversion rates on your ad pages." },
      { title: "Weekly Optimization", description: "Constant testing to lower CPA and scale winners." },
    ],
    process: [
      { step: "01", title: "Audit", description: "Review your current account or market landscape." },
      { step: "02", title: "Strategy", description: "Keyword research, ad copy, and campaign structure." },
      { step: "03", title: "Launch", description: "Full campaign build with tracking and A/B tests." },
      { step: "04", title: "Optimize & Scale", description: "Weekly refinements to grow ROAS." },
    ],
    benefits: [
      "Instant, targeted traffic",
      "Full control over budget and audience",
      "Transparent reporting and clear ROI",
      "Google-certified account managers",
    ],
    faqs: [
      { q: "What's a good starting budget?", a: "Most B2C clients start at $1,000–$3,000/month. B2B and competitive niches usually need $3,000+." },
      { q: "Do I own my Google Ads account?", a: "Yes, always. We manage inside your account so you keep full history and data." },
      { q: "How soon will I see leads?", a: "Well-built Search campaigns typically deliver leads within the first week." },
    ],
  },
  {
    slug: "meta-ads",
    name: "Meta Ads Manager",
    shortName: "Meta Ads",
    tagline: "Facebook & Instagram ads that scale profitably",
    icon: "📱",
    hero: "Meta Ads That Convert Scrollers Into Buyers",
    heroImage:
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Full-funnel Facebook and Instagram advertising — from creative to targeting to optimization — engineered to lower CPA and grow revenue.",
    description:
      "We run Meta ads for e-commerce, lead-gen, and local businesses. Our approach combines scroll-stopping creative, sharp audience targeting, iOS 14+ compliant tracking, and daily optimization.",
    features: [
      { title: "Creative Strategy", description: "Thumb-stopping video and static ads that convert." },
      { title: "Audience Targeting", description: "Interest, lookalike, and retargeting audiences." },
      { title: "Full-Funnel Campaigns", description: "Awareness, consideration, and conversion layers." },
      { title: "Pixel & CAPI Setup", description: "iOS-friendly tracking for accurate attribution." },
      { title: "Retargeting", description: "Bring back warm visitors and abandoned carts." },
      { title: "A/B Testing", description: "Constant creative and audience testing." },
    ],
    process: [
      { step: "01", title: "Discovery", description: "Understand product, offer, and customer avatars." },
      { step: "02", title: "Creative & Setup", description: "Build ad creative, pixel, and campaign structure." },
      { step: "03", title: "Launch", description: "Launch with testing budget to find winners." },
      { step: "04", title: "Scale", description: "Scale winning ad sets and iterate creative weekly." },
    ],
    benefits: [
      "Massive reach across Facebook & Instagram",
      "Best-in-class targeting capabilities",
      "Great for both e-commerce and lead-gen",
      "Fast feedback loop for testing offers",
    ],
    faqs: [
      { q: "What budget should I start with?", a: "Minimum $30/day for meaningful data. Most brands scale from $50–$500/day quickly." },
      { q: "Do you make the ad creative?", a: "Yes — we produce static, carousel, and short-form video creatives in-house." },
      { q: "How is performance tracked?", a: "We set up Meta Pixel + Conversions API for accurate iOS-safe tracking." },
    ],
  },
  {
    slug: "marketing",
    name: "Digital Marketing",
    shortName: "Marketing",
    tagline: "Full-service marketing that grows your brand",
    icon: "🚀",
    hero: "End-to-End Digital Marketing That Grows Revenue",
    heroImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
    intro:
      "One team, one strategy, one goal — growth. From SEO and paid ads to social, email, and content, we run your entire digital marketing engine.",
    description:
      "Stop juggling five agencies. We become your outsourced marketing team, running strategy, execution, and reporting across every channel that matters for your business.",
    features: [
      { title: "Marketing Strategy", description: "Data-driven roadmap tailored to your goals." },
      { title: "SEO + Content", description: "Rank higher and publish content that converts." },
      { title: "Paid Media", description: "Google, Meta, TikTok, and LinkedIn ads." },
      { title: "Social Media", description: "Organic content that builds community." },
      { title: "Email Marketing", description: "Automation and campaigns that nurture and convert." },
      { title: "Analytics & CRO", description: "Continuous testing to grow conversion rates." },
    ],
    process: [
      { step: "01", title: "Audit & Strategy", description: "Full audit of channels and 90-day plan." },
      { step: "02", title: "Setup", description: "Tracking, tools, creative, and content pipeline." },
      { step: "03", title: "Execute", description: "Run campaigns across chosen channels." },
      { step: "04", title: "Report & Scale", description: "Monthly reports and quarterly strategy reviews." },
    ],
    benefits: [
      "One accountable team for all channels",
      "Consistent brand across every touchpoint",
      "Lower total cost than multiple vendors",
      "Faster growth from integrated strategy",
    ],
    faqs: [
      { q: "Is this a monthly retainer?", a: "Yes — monthly retainers ranging from $1,500 to $10,000+ depending on scope." },
      { q: "Can I pick specific channels?", a: "Absolutely. We can focus on any combination of SEO, ads, social, and email." },
      { q: "Do you sign lock-in contracts?", a: "No long-term lock-ins. Month-to-month after an initial 90-day setup period." },
    ],
  },
  {
    slug: "ai-graphic-design",
    name: "AI Graphic Designing",
    shortName: "AI Graphic Design",
    tagline: "Stunning visuals powered by AI + human craft",
    icon: "🎨",
    hero: "AI-Powered Graphic Design That Sets Your Brand Apart",
    heroImage:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1600&q=80",
    intro:
      "We combine cutting-edge AI tools with expert designers to produce beautiful, on-brand visuals faster and more affordably than ever.",
    description:
      "From social media creatives to product mockups, ad creatives, and brand illustrations — we use the best of AI tools (Midjourney, Firefly, DALL·E) refined by human designers so every visual is polished, on-brand, and ready to publish.",
    features: [
      { title: "Social Media Creatives", description: "On-brand posts, reels covers, and story graphics." },
      { title: "Ad Creatives", description: "High-converting static and video ads for Meta and Google." },
      { title: "Product Mockups", description: "Photorealistic mockups without a photoshoot." },
      { title: "Brand Illustrations", description: "Unique illustrations to elevate your brand identity." },
      { title: "Logo & Identity", description: "AI-assisted logos refined by human designers." },
      { title: "Rapid Turnaround", description: "First drafts in 24–48 hours." },
    ],
    process: [
      { step: "01", title: "Brief", description: "Understand brand, style, and use case." },
      { step: "02", title: "AI Generation", description: "Rapid concept generation with top AI tools." },
      { step: "03", title: "Human Refinement", description: "Designers polish, brand, and finalize." },
      { step: "04", title: "Delivery", description: "Final files in every format you need." },
    ],
    benefits: [
      "Up to 10x faster than traditional design",
      "Fraction of the cost of stock photoshoots",
      "Unique visuals — no more stock cliches",
      "Endless variations for A/B testing",
    ],
    faqs: [
      { q: "Are AI-generated designs copyright-free?", a: "Yes — we use tools with commercial licenses and always add human refinement to ensure originality." },
      { q: "Can you match my existing brand?", a: "Definitely. We train on your brand guidelines to keep every visual consistent." },
      { q: "How many revisions are included?", a: "Unlimited revisions until you're happy with the final result." },
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}
