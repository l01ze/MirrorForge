/* ============================================================
   MirrorForge — Prompt Engine
   Builds comprehensive 1:1 replication prompts from
   scanned content, ideas, or clone analysis.
   ============================================================ */

/**
 * Build the final master prompt based on input mode and source.
 * @param {Object} opts
 * @param {string} opts.mode - 'website' | 'app'
 * @param {string} opts.source - 'url' | 'idea' | 'clone'
 * @param {string} opts.rawInput - The user's raw input
 * @param {string} opts.scrapedContent - Scraped page text
 * @param {string} opts.pageTitle - Page title
 * @param {string} opts.pageUrl - Page URL
 * @returns {string} The complete replication prompt
 */
function buildFinalPrompt({ mode, source, rawInput, scrapedContent, pageTitle, pageUrl }) {
  let analysis = '';
  let spec = '';

  if (source === 'url') {
    analysis = analyzeFromUrl(rawInput, scrapedContent, pageTitle, pageUrl);
    spec = buildSpecFromAnalysis(analysis, mode);
  } else if (source === 'idea') {
    analysis = analyzeFromIdea(rawInput);
    spec = buildSpecFromIdea(analysis, mode);
  } else if (source === 'clone') {
    analysis = analyzeForClone(rawInput);
    spec = buildSpecFromClone(analysis, mode);
  }

  const prompt = assembleMasterPrompt(spec, mode);
  return prompt;
}

/* ============================================================
   ANALYSIS LAYER
   ============================================================ */

function analyzeFromUrl(url, scrapedContent, pageTitle, pageUrl) {
  const lines = [];
  lines.push(`## SOURCE TARGET`);
  lines.push(`- URL: ${pageUrl || url}`);
  lines.push(`- Title: ${pageTitle || 'Unknown'}`);
  lines.push(``);

  if (scrapedContent && scrapedContent.length > 50) {
    const truncated = scrapedContent.substring(0, 12000);
    lines.push(`## SCRAPED CONTENT`);
    lines.push(truncated);
    lines.push(``);
  } else {
    lines.push(`## SCRAPED CONTENT`);
    lines.push(`(No significant content extracted — the page may be JS-rendered, behind auth, or a restricted browser page.)`);
    lines.push(``);
  }

  return lines.join('\n');
}

function analyzeFromIdea(idea) {
  const lines = [];
  lines.push(`## ORIGINAL IDEA`);
  lines.push(idea);
  lines.push(``);

  const inferredType = inferProductType(idea);
  lines.push(`## INFERRED PRODUCT TYPE`);
  lines.push(inferredType);
  lines.push(``);

  const features = extractFeatures(idea);
  if (features.length > 0) {
    lines.push(`## INFERRED FEATURES / SECTIONS`);
    features.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
    lines.push(``);
  }

  return lines.join('\n');
}

function analyzeForClone(input) {
  // Try to detect if it's a URL
  if (isUrl(input)) {
    return `## CLONE TARGET\n- URL: ${input}\n\n## CLONE MODE\nFull business/feature replication requested.\n`;
  }

  const lines = [];
  lines.push(`## CLONE DESCRIPTION`);
  lines.push(input);
  lines.push(``);

  const inferredType = inferProductType(input);
  lines.push(`## INFERRED PRODUCT TYPE`);
  lines.push(inferredType);
  lines.push(``);

  const features = extractFeatures(input);
  if (features.length > 0) {
    lines.push(`## INFERRED FEATURES`);
    features.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
    lines.push(``);
  }

  return lines.join('\n');
}

/* ============================================================
   SPEC BUILDERS
   ============================================================ */

function buildSpecFromAnalysis(analysis, mode) {
  return analysis;
}

function buildSpecFromIdea(analysis, mode) {
  return analysis;
}

function buildSpecFromClone(analysis, mode) {
  return analysis;
}

/* ============================================================
   MASTER PROMPT ASSEMBLER
   ============================================================ */

function assembleMasterPrompt(spec, mode) {
  const targetType = mode === 'website' ? 'Website' : 'Mobile/Desktop Application';

  const parts = [];

  // --- Header ---
  parts.push(`You are an expert front-end developer and UI/UX designer. Your task is to build a pixel-perfect, fully functional ${targetType} based on the specifications below.`);
  parts.push(`Read every section carefully. Do not skip any detail. Build everything described.`);
  parts.push(``);

  // --- Execution Rules ---
  parts.push(`## EXECUTION RULES`);
  parts.push(`1. Use semantic HTML5, modern CSS3 (custom properties, grid, flexbox, container queries, animations), and vanilla ES6+ JavaScript (no frameworks unless specified).`);
  parts.push(`2. Responsive design is mandatory: mobile-first, breakpoints at 480px, 768px, 1024px, 1440px.`);
  parts.push(`3. Dark mode support via prefers-color-scheme media query.`);
  parts.push(`4. Accessibility: WCAG AA minimum — proper heading hierarchy, aria-labels, focus management, keyboard navigation, alt text, color contrast >= 4.5:1.`);
  parts.push(`5. Performance: lazy-load images, use transform/opacity for animations, debounce scroll/resize events, reduce layout shifts.`);
  parts.push(`6. All interactive elements must have hover, focus, active, and disabled states.`);
  parts.push(`7. Animations: 150-300ms ease-out for micro-interactions, use requestAnimationFrame for JS-driven animations, respect prefers-reduced-motion.`);
  parts.push(`8. Form inputs must have visible labels, inline validation on blur, clear error messages, and focus management.`);
  parts.push(`9. Touch targets minimum 44x44px.`);
  parts.push(`10. Use CSS custom properties for all colors, spacing, typography, and radii.`);
  parts.push(``);

  // --- Specification ---
  parts.push(`## SPECIFICATION`);
  parts.push(spec);
  parts.push(``);

  // --- Visual Design System ---
  parts.push(`## VISUAL DESIGN SYSTEM`);
  parts.push(`### Background & Surfaces`);
  parts.push(`- Primary background: #0A0A0A (near-black)`);
  parts.push(`- Secondary background: #121212`);
  parts.push(`- Surface cards/containers: #1A1A1A`);
  parts.push(`- Elevated surfaces: #222222`);
  parts.push(`- Hover states: #2A2A2A`);
  parts.push(``);
  parts.push(`### Colors`);
  parts.push(`- Primary accent: #00E5FF (cyan) — used for CTAs, active states, toggles, links`);
  parts.push(`- Secondary accent: #A855F7 (purple) — used for "App" mode indicator, secondary highlights`);
  parts.push(`- Success: #10B981 (emerald)`);
  parts.push(`- Error: #EF4444 (red)`);
  parts.push(`- Warning: #F59E0B (amber)`);
  parts.push(``);
  parts.push(`### Typography`);
  parts.push(`- Font family: 'Geist', 'Inter', system-ui, -apple-system, sans-serif`);
  parts.push(`- Monospace: 'Geist Mono', 'SF Mono', 'Fira Code', monospace`);
  parts.push(`- Display/headlines: font-weight 600-700, letter-spacing -0.02em to -0.01em`);
  parts.push(`- Body: font-weight 400, line-height 1.5-1.75, letter-spacing 0`);
  parts.push(`- Small/captions: font-size 0.75rem-0.8125rem, color #9CA3AF`);
  parts.push(`- Scale: 0.6875rem / 0.75rem / 0.8125rem / 0.875rem / 1rem / 1.125rem / 1.25rem / 1.5rem / 2rem / 2.5rem`);
  parts.push(``);
  parts.push(`### Borders & Radii`);
  parts.push(`- Border color: #2A2A2A, subtle border: #1E1E1E`);
  parts.push(`- Surface radius: 12px`);
  parts.push(`- Pill/pill buttons: 999px`);
  parts.push(`- Input radius: 8px`);
  parts.push(`- Border width: 1px default`);
  parts.push(``);
  parts.push(`### Shadows`);
  parts.push(`- Small: 0 1px 3px rgba(0,0,0,0.3)`);
  parts.push(`- Medium: 0 4px 12px rgba(0,0,0,0.4)`);
  parts.push(`- Large: 0 8px 32px rgba(0,0,0,0.5)`);
  parts.push(`- Accent glow: 0 0 20px rgba(0,229,255,0.15)`);
  parts.push(``);
  parts.push(`### Glassmorphism (where specified)`);
  parts.push(`- background: rgba(26, 26, 26, 0.8)`);
  parts.push(`- backdrop-filter: blur(20px)`);
  parts.push(`- border: 1px solid rgba(255,255,255,0.06)`);
  parts.push(``);
  parts.push(`### Animation Tokens`);
  parts.push(`- Fast: 150ms cubic-bezier(0.16, 1, 0.3, 1)`);
  parts.push(`- Base: 250ms cubic-bezier(0.16, 1, 0.3, 1)`);
  parts.push(`- Slow: 400ms cubic-bezier(0.16, 1, 0.3, 1)`);
  parts.push(``);
  parts.push(`## LAYOUT`);
  parts.push(`- Max content width: 1200px, centered with mx-auto`);
  parts.push(`- Spacing scale based on 4px/8px increments: 4, 8, 12, 16, 20, 24, 32, 48, 64`);
  parts.push(`- Section padding: py-16 to py-24 (4rem-6rem)`);
  parts.push(`- Use CSS Grid for multi-column layouts, flexbox for component-level layouts`);
  parts.push(``);
  parts.push(`## COMPONENTS TO BUILD`);
  parts.push(`Build every component listed below. Each must be complete, styled, and functional.`);
  parts.push(``);
  parts.push(`### 1. Navigation / Header`);
  parts.push(`- Logo (left), navigation links (center), CTA button (right)`);
  parts.push(`- Sticky on scroll with backdrop-blur`);
  parts.push(`- Mobile: hamburger menu with slide-in overlay`);
  parts.push(`- Active link state with bottom indicator`);
  parts.push(`- Max height: 72px, single line on desktop`);
  parts.push(``);
  parts.push(`### 2. Hero Section`);
  parts.push(`- Full viewport height (min-h-[100dvh])`);
  parts.push(`- Headline (max 2 lines, font-size clamp 2.5rem-5rem)`);
  parts.push(`- Subtext (max 20 words)`);
  parts.push(`- Primary CTA + optional secondary link`);
  parts.push(`- Visual asset: image, illustration, or graphic (right side or background)`);
  parts.push(`- Subtle entrance animation on load`);
  parts.push(`- Max top padding: pt-24`);
  parts.push(``);
  parts.push(`### 3. Feature Section`);
  parts.push(`- 3-6 feature cards in a responsive grid`);
  parts.push(`- Each card: icon/image, title, description`);
  parts.push(`- Hover: subtle scale(1.02) + brighter border`);
  parts.push(`- Not three equal columns — use asymmetric grid where possible`);
  parts.push(``);
  parts.push(`### 4. Social Proof / Logo Wall`);
  parts.push(`- Row of client/partner logos (SVG or text)`);
  parts.push(`- Below hero, before features`);
  parts.push(`- Grayscale by default, color on hover`);
  parts.push(``);
  parts.push(`### 5. Testimonials / Quotes`);
  parts.push(`- Card with quote text (max 3 lines), avatar, name, role`);
  parts.push(`- Optional: carousel or alternating layout`);
  parts.push(`- Max 3 featured testimonials`);
  parts.push(``);
  parts.push(`### 6. CTA Section`);
  parts.push(`- Headline + subtext + primary CTA button`);
  parts.push(`- Centered or split layout`);
  parts.push(`- Background accent or gradient`);
  parts.push(``);
  parts.push(`### 7. Footer`);
  parts.push(`- Multi-column links: Product, Company, Resources, Legal`);
  parts.push(`- Social media icons`);
  parts.push(`- Copyright notice`);
  parts.push(`- Dark background (one level darker than page)`);
  parts.push(``);

  // Mode-specific extras
  if (mode === 'app') {
    parts.push(`### Mobile/App Specifics`);
    parts.push(`- Bottom tab navigation (max 5 tabs, icons + labels)`);
    parts.push(`- Safe area insets for notch/home indicator`);
    parts.push(`- Touch feedback: opacity + scale on press`);
    parts.push(`- Swipe-to-go-back gesture support`);
    parts.push(`- 44x44pt minimum touch targets`);
    parts.push(`- Loading skeleton states for async content`);
    parts.push(`- Pull-to-refresh pattern`);
    parts.push(`- Modal/sheet transition: slide up from bottom`);
    parts.push(``);
  }

  // --- States ---
  parts.push(`## ALL COMPONENT STATES`);
  parts.push(`Implement every state for every component:`);
  parts.push(`- Default/resting`);
  parts.push(`- Hover (cursor: pointer, visual feedback)`);
  parts.push(`- Active/pressed (scale or opacity shift)`);
  parts.push(`- Focus (visible focus ring, 2-3px offset)`);
  parts.push(`- Disabled (opacity 0.4, cursor: not-allowed)`);
  parts.push(`- Loading (skeleton pulsing or spinner)`);
  parts.push(`- Empty (meaningful empty state with guidance)`);
  parts.push(`- Error (clear message with recovery action)`);
  parts.push(`- Success (brief confirmation feedback)`);
  parts.push(``);

  // --- Performance ---
  parts.push(`## PERFORMANCE BUDGET`);
  parts.push(`- First Contentful Paint (FCP) < 1.5s`);
  parts.push(`- Largest Contentful Paint (LCP) < 2.5s`);
  parts.push(`- Cumulative Layout Shift (CLS) < 0.1`);
  parts.push(`- Time to Interactive (TTI) < 3.5s`);
  parts.push(`- Lighthouse score >= 90 in all categories`);
  parts.push(``);

  // --- Accessibility (full) ---
  parts.push(`## ACCESSIBILITY CHECKLIST`);
  parts.push(`- [ ] All images have descriptive alt text`);
  parts.push(`- [ ] Proper heading hierarchy (h1 -> h6, no skips)`);
  parts.push(`- [ ] All form inputs have associated labels`);
  parts.push(`- [ ] Color contrast >= 4.5:1 for normal text, 3:1 for large text`);
  parts.push(`- [ ] Focus visible on all interactive elements`);
  parts.push(`- [ ] Keyboard navigation: Tab order matches visual order`);
  parts.push(`- [ ] aria-expanded on accordions/disclosures`);
  parts.push(`- [ ] aria-label on icon-only buttons`);
  parts.push(`- [ ] role="status" or aria-live="polite" for dynamic updates`);
  parts.push(`- [ ] Skip to main content link`);
  parts.push(`- [ ] prefers-reduced-motion respected`);
  parts.push(`- [ ] prefers-color-scheme supported for dark mode`);
  parts.push(``);

  // --- Final instruction ---
  parts.push(`## DELIVERABLE`);
  parts.push(`Generate a single HTML file (or a zip of HTML + CSS + JS) containing the complete ${targetType}.`);
  parts.push(`Include all styles inline or in a linked CSS file. All JavaScript must be vanilla ES6+ in a linked JS file or inline script (with proper CSP nonce if needed).`);
  parts.push(`The output must be production-ready: no todos, no placeholders, no "// rest of the code" comments.`);
  parts.push(`Every piece of text on the screen must be intentional, grammatically correct, and context-appropriate.`);
  parts.push(`Do not use lorem ipsum. Use real, meaningful copy.`);
  parts.push(``);
  parts.push(`Build it as if you were shipping to production today.`);

  return parts.join('\n');
}

/* ============================================================
   INFERENCE HELPERS
   ============================================================ */

function inferProductType(text) {
  const lower = text.toLowerCase();

  if (/\b(saas|dashboard|analytics|metrics|report|billing|subscription)\b/.test(lower)) {
    return 'SaaS / Analytics Platform';
  }
  if (/\b(ecommerce|shop|store|cart|checkout|product|pricing|marketplace)\b/.test(lower)) {
    return 'E-commerce / Marketplace';
  }
  if (/\b(social|feed|post|message|chat|community|forum|discussion)\b/.test(lower)) {
    return 'Social / Community Platform';
  }
  if (/\b(portfolio|gallery|showcase|work|project|creative|design)\b/.test(lower)) {
    return 'Portfolio / Creative Showcase';
  }
  if (/\b(blog|article|news|editorial|magazine|publication|content)\b/.test(lower)) {
    return 'Blog / Editorial / Content';
  }
  if (/\b(landing|marketing|homepage|hero|brand|promo)\b/.test(lower)) {
    return 'Marketing Landing Page';
  }
  if (/\b(education|course|learning|tutorial|class|training|lesson)\b/.test(lower)) {
    return 'Education / Learning Platform';
  }
  if (/\b(game|gaming|leaderboard|score|play|level|achievement)\b/.test(lower)) {
    return 'Gaming / Entertainment';
  }
  if (/\b(health|fitness|wellness|medical|patient|doctor|clinic)\b/.test(lower)) {
    return 'Health / Fitness / Medical';
  }
  if (/\b(finance|banking|investment|payment|wallet|money|crypto|blockchain)\b/.test(lower)) {
    return 'Finance / Fintech';
  }
  if (/\b(travel|hotel|booking|flight|vacation|trip|destination)\b/.test(lower)) {
    return 'Travel / Hospitality';
  }
  if (/\b(real.estate|property|rental|listing|mortgage|apartment)\b/.test(lower)) {
    return 'Real Estate / Property';
  }
  if (/\b(food|restaurant|recipe|cooking|delivery|menu|meal)\b/.test(lower)) {
    return 'Food / Restaurant / Recipe';
  }
  if (/\b(tool|utility|calculator|converter|generator|editor|scanner)\b/.test(lower)) {
    return 'Web Tool / Utility';
  }
  if (/\b(ai|artificial.intelligence|machine.learning|ml|llm|gpt|neural)\b/.test(lower)) {
    return 'AI / Machine Learning Product';
  }
  if (/\b(music|audio|podcast|playlist|streaming|sound)\b/.test(lower)) {
    return 'Music / Audio / Podcast';
  }
  if (/\b(video|streaming|movie|tv|watch|film|cinema)\b/.test(lower)) {
    return 'Video / Streaming Platform';
  }
  if (/\b(event|ticket|conference|meetup|workshop|webinar)\b/.test(lower)) {
    return 'Event / Ticketing Platform';
  }
  if (/\b(recruiting|job|hiring|career|resume|application)\b/.test(lower)) {
    return 'Recruiting / Job Board';
  }

  return 'Web Application / Landing Page';
}

function extractFeatures(text) {
  const features = [];

  // Split on common delimiters
  const lines = text.split(/[.\n\r]+/).map((s) => s.trim()).filter(Boolean);

  for (const line of lines) {
    // Skip very short lines
    if (line.length < 15) continue;

    // Look for feature-like phrases
    if (
      /\b(ability to|allows|can |feature |includes|provides|supports|enables|lets you|built.with|powered.by|integrat)\b/i.test(line) ||
      /\b(login|signup|auth|search|filter|sort|upload|download|share|like|comment|follow|notif|dashboard|report|chart|payment|checkout|cart|pricing|profile|setting|message|chat|post|feed|import|export|sync|track|monitor|schedule|remind|bookmark|save|rate|review|subscribe|manage|create|edit|delete|view|browse|explore|discover)\b/i.test(line)
    ) {
      features.push(line.replace(/^[-*\s]+/, '').trim());
    }
  }

  // Deduplicate
  return [...new Set(features)];
}

function isUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
