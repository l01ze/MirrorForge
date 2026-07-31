/* ============================================================
   MirrorForge — Popup Script
   Features: state persistence, auto-fill URL, Ctrl+Enter,
   prompt history, download .txt, char counts, all animations.
   Zero imports. Zero external deps.
   ============================================================ */

/* ============================================================
   STATE
   ============================================================ */
const state = {
  mode: 'website',
  source: 'url',
  cloneScope: 'single',  // 'single' | 'full'
  isGenerating: false,
  lastOutput: '',
  history: [],
  detailLevel: 5,
  framework: 'auto',
  css: 'auto',
  model: 'auto',
  theme: 'midnight',
  customColors: null,
};
const MAX_HISTORY = 5;

/* ============================================================
   THEMES
   ============================================================ */
const THEMES = {
  midnight: {
    '--bg-primary': '#0A0A0A', '--bg-surface': '#121212', '--bg-elevated': '#1A1A1A', '--bg-inset': '#0f0f0f',
    '--text-primary': '#E8E8E8', '--text-secondary': '#9CA3AF', '--text-muted': '#4B5563',
    '--accent': '#3B82F6', '--accent-soft': 'rgba(59,130,246,0.15)', '--accent-border': 'rgba(59,130,246,0.3)', '--accent-shadow': 'rgba(59,130,246,0.25)',
    '--border': '#1E1E1E', '--border-hover': '#333', '--border-accent': '#3B82F6',
  },
  slate: {
    '--bg-primary': '#0F1117', '--bg-surface': '#161822', '--bg-elevated': '#1D1F2E', '--bg-inset': '#0B0D13',
    '--text-primary': '#E2E8F0', '--text-secondary': '#94A3B8', '--text-muted': '#475569',
    '--accent': '#64748B', '--accent-soft': 'rgba(100,116,139,0.15)', '--accent-border': 'rgba(100,116,139,0.3)', '--accent-shadow': 'rgba(100,116,139,0.25)',
    '--border': '#1E2235', '--border-hover': '#334155', '--border-accent': '#64748B',
  },
  emerald: {
    '--bg-primary': '#0A0F0A', '--bg-surface': '#111811', '--bg-elevated': '#181F18', '--bg-inset': '#060A06',
    '--text-primary': '#E8F0E8', '--text-secondary': '#9CAF9C', '--text-muted': '#4B5F4B',
    '--accent': '#10B981', '--accent-soft': 'rgba(16,185,129,0.15)', '--accent-border': 'rgba(16,185,129,0.3)', '--accent-shadow': 'rgba(16,185,129,0.25)',
    '--border': '#1E261E', '--border-hover': '#2A3A2A', '--border-accent': '#10B981',
  },
  amber: {
    '--bg-primary': '#0F0E0A', '--bg-surface': '#181610', '--bg-elevated': '#201E18', '--bg-inset': '#0A0906',
    '--text-primary': '#F0EDE8', '--text-secondary': '#AFAA9C', '--text-muted': '#5F5C4B',
    '--accent': '#F59E0B', '--accent-soft': 'rgba(245,158,11,0.15)', '--accent-border': 'rgba(245,158,11,0.3)', '--accent-shadow': 'rgba(245,158,11,0.25)',
    '--border': '#26231E', '--border-hover': '#3A352A', '--border-accent': '#F59E0B',
  },
  rose: {
    '--bg-primary': '#0F0A0D', '--bg-surface': '#181015', '--bg-elevated': '#20181E', '--bg-inset': '#0A0609',
    '--text-primary': '#F0E8EC', '--text-secondary': '#AF9CA5', '--text-muted': '#5F4B54',
    '--accent': '#EC4899', '--accent-soft': 'rgba(236,72,153,0.15)', '--accent-border': 'rgba(236,72,153,0.3)', '--accent-shadow': 'rgba(236,72,153,0.25)',
    '--border': '#261E22', '--border-hover': '#3A2A32', '--border-accent': '#EC4899',
  },
  ocean: {
    '--bg-primary': '#0A0D0F', '--bg-surface': '#101518', '--bg-elevated': '#181D20', '--bg-inset': '#06080A',
    '--text-primary': '#E8EDF0', '--text-secondary': '#9CA8AF', '--text-muted': '#4B585F',
    '--accent': '#06B6D4', '--accent-soft': 'rgba(6,182,212,0.15)', '--accent-border': 'rgba(6,182,212,0.3)', '--accent-shadow': 'rgba(6,182,212,0.25)',
    '--border': '#1E2226', '--border-hover': '#2A323A', '--border-accent': '#06B6D4',
  },
  forest: {
    '--bg-primary': '#0A0F0D', '--bg-surface': '#111815', '--bg-elevated': '#18201C', '--bg-inset': '#060A08',
    '--text-primary': '#E8F0EC', '--text-secondary': '#9CAFA6', '--text-muted': '#4B5F56',
    '--accent': '#059669', '--accent-soft': 'rgba(5,150,105,0.15)', '--accent-border': 'rgba(5,150,105,0.3)', '--accent-shadow': 'rgba(5,150,105,0.25)',
    '--border': '#1E2621', '--border-hover': '#2A3A32', '--border-accent': '#059669',
  },
  sunset: {
    '--bg-primary': '#0F0D0A', '--bg-surface': '#181510', '--bg-elevated': '#201D18', '--bg-inset': '#0A0806',
    '--text-primary': '#F0EDE8', '--text-secondary': '#AFAAA0', '--text-muted': '#5F5A50',
    '--accent': '#F97316', '--accent-soft': 'rgba(249,115,22,0.15)', '--accent-border': 'rgba(249,115,22,0.3)', '--accent-shadow': 'rgba(249,115,22,0.25)',
    '--border': '#26231E', '--border-hover': '#3A352E', '--border-accent': '#F97316',
  },
  mono: {
    '--bg-primary': '#0A0A0A', '--bg-surface': '#141414', '--bg-elevated': '#1C1C1C', '--bg-inset': '#050505',
    '--text-primary': '#E8E8E8', '--text-secondary': '#A0A0A0', '--text-muted': '#555555',
    '--accent': '#6B7280', '--accent-soft': 'rgba(107,114,128,0.15)', '--accent-border': 'rgba(107,114,128,0.3)', '--accent-shadow': 'rgba(107,114,128,0.25)',
    '--border': '#1E1E1E', '--border-hover': '#333333', '--border-accent': '#6B7280',
  },
};

/* ============================================================
   DOM REFS
   ============================================================ */
const $ = (s, ctx) => (ctx || document).querySelector(s);
const $$ = (s, ctx) => [...(ctx || document).querySelectorAll(s)];

const dom = {
  pillBtns: () => $$('.pill-btn'),
  panelUrl: $('#panelUrl'),
  panelText: $('#panelText'),
  urlInput: $('#urlInput'),
  urlError: $('#urlError'),
  textInput: $('#textInput'),
  scanBtn: $('#scanBtn'),
  frameworkSelect: $('#frameworkSelect'),
  cssSelect: $('#cssSelect'),
  modelSelect: $('#modelSelect'),
  forgeBtn: $('#forgeBtn'),
  forgeText: $('#forgeText'),
  forgeSpinner: $('#forgeSpinner'),
  errorBanner: $('#errorBanner'),
  errorText: $('#errorText'),
  output: $('#output'),
  outputText: $('#outputText'),
  copyBtn: $('#copyBtn'),
  tokenCount: $('#tokenCount'),
  downloadBtn: $('#downloadBtn'),
  toastContainer: $('#toastContainer'),
  laserOverlay: () => document.getElementById('laserOverlay'),
  history: $('#history'),
  historyList: $('#historyList'),
  historyToggle: () => $('.history-toggle'),
  settingsBtn: $('#settingsBtn'),
  detailSlider: $('#detailSlider'),
  detailTooltip: $('#detailTooltip'),
  footerBadge: document.getElementById('footerBadge'),
  pageContainer: $('#pageContainer'),
  settingsBackBtn: $('#settingsBackBtn'),
  customColorPanel: $('#customColorPanel'),
  colorBg: $('#colorBg'),
  colorAccent: $('#colorAccent'),
  colorText: $('#colorText'),
  colorSurface: $('#colorSurface'),
  applyCustomBtn: $('#applyCustomBtn'),
  footerModelDisplay: $('#footerModelDisplay'),
  cloneScopeRow: $('#cloneScopeRow'),
  cloneScopeBtns: () => $$('.scope-btn'),
  cloneScopeHint: $('#cloneScopeHint'),
};

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  bindPillSelector();
  bindCloneScopeToggle();
  bindForgeBtn();
  bindCopyBtn();
  bindScanBtn();
  bindDragDrop();
  bindCtrlEnter();
  bindCharCounts();
  bindHistoryToggle();
  bindDownload();
  bindSettings();
  bindSettingsBack();
  bindDetailSlider();
  bindThemeSelector();
  bindCustomColor();
  bindUrlValidation();
  window.addEventListener('beforeunload', saveState);
  await loadFullState();
  bindTechStack();
  await autoFillUrl();
}

/* ============================================================
   PILL SELECTOR (mode + source unified)
   ============================================================ */
function bindPillSelector() {
  dom.pillBtns().forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.isGenerating) return;
      dom.pillBtns().forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      state.mode = btn.dataset.mode;
      state.source = btn.dataset.source;
      // Toggle input panels
      $$('.input-panel').forEach(p => p.classList.remove('active'));
      const panel = state.source === 'url' ? dom.panelUrl : dom.panelText;
      if (panel) panel.classList.add('active');
      dom.urlInput.disabled = state.source !== 'url';
      dom.textInput.disabled = state.source !== 'text';
      // Show/hide clone scope row (only for Web URL mode)
      if (dom.cloneScopeRow) {
        const showScope = state.mode === 'website' && state.source === 'url';
        dom.cloneScopeRow.style.display = showScope ? 'block' : 'none';
      }
      saveState();
    });
  });
}

/* ============================================================
   CLONE SCOPE TOGGLE
   ============================================================ */
function bindCloneScopeToggle() {
  dom.cloneScopeBtns().forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.isGenerating) return;
      dom.cloneScopeBtns().forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      state.cloneScope = btn.dataset.scope;
      // Update hint text
      if (dom.cloneScopeHint) {
        dom.cloneScopeHint.textContent = state.cloneScope === 'full'
          ? 'Site architecture will be extracted from navigation links'
          : 'Cloning current page only — use Full Site for multi-page output';
      }
      saveState();
    });
  });
}

/* ============================================================
   FORGE BUTTON
   ============================================================ */
function bindForgeBtn() {
  dom.forgeBtn.addEventListener('click', handleForge);
}

async function handleForge() {
  if (state.isGenerating) return;

  // Hide any previous error
  hideError();

  let input = '';
  if (state.source === 'url') {
    input = dom.urlInput.value.trim();
    if (!input) { showToast('Enter a URL or scan the current tab.', 'error'); dom.urlInput.focus(); return; }
    if (!isValidUrl(input)) { showToast('Enter a valid URL — web (https://) or local file (file://).', 'error'); dom.urlInput.focus(); return; }
  } else if (state.source === 'text') {
    input = dom.textInput.value.trim();
    if (input.length < 10) { showToast('Describe what to build in at least 10 characters.', 'error'); dom.textInput.focus(); return; }
  }

  state.isGenerating = true;
  dom.forgeBtn.classList.add('loading');
  dom.forgeBtn.disabled = true;
  dom.forgeText.innerHTML = 'Forging…';
  dom.urlInput.disabled = true;
  dom.textInput.disabled = true;
  dom.scanBtn.disabled = true;

  try {
    await runGeneration(input);
  } catch (err) {
    console.error('[MirrorForge]', err);
    showError(err.message || 'Generation failed.');
  } finally {
    state.isGenerating = false;
    dom.forgeBtn.classList.remove('loading');
    dom.forgeBtn.disabled = false;
    dom.forgeText.innerHTML = '<svg class="forge-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Forge Prompt';
    dom.urlInput.disabled = state.source !== 'url';
    dom.textInput.disabled = state.source !== 'text';
    dom.scanBtn.disabled = false;
  }
}

async function runGeneration(rawInput) {
  let scraped = '';
  let visualReport = '';
  let strippedHTML = '';
  let pageImages = [];
  let pageTitle = '';
  let pageUrl = '';
  let pageLinks = [];
  let pageNavItems = [];
  let siteStructure = null;

  if (state.source === 'url') {
    try {
      const url = rawInput.trim();
      const result = url.startsWith('file://')
        ? await fetchFileContent(url)
        : await scrapeUrlViaTab(url);
      scraped = result.content || '';
      visualReport = result.visualReport || '';
      strippedHTML = result.strippedHTML || '';
      pageImages = result.images || [];
      pageLinks = result.links || [];
      pageNavItems = result.navItems || [];
      siteStructure = result.siteStructure || null;
      pageTitle = result.title || '';
      pageUrl = url;
    } catch (err) {
      console.warn('[MirrorForge] fetch failed:', err);
      showError(err.message || 'Could not fetch the page content.');
      throw new Error('Scraping failed');
    }
  }

/* ============================================================
   FETCH-BASED URL SCRAPING (hidden, no tab needed)
   ============================================================ */
async function fetchUrlContent(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      if (response.status === 404) throw new Error('Page not found (404) — the URL may be incorrect.');
      if (response.status >= 500) throw new Error('Server error (' + response.status + ') — the page is not responding correctly.');
      throw new Error('Failed to fetch page (HTTP ' + response.status + ').');
    }
    const html = await response.text();
    if (!html || html.length < 50) {
      throw new Error('Page returned no meaningful content (too short or empty).');
    }
    return parseHTMLContent(html, url);
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out — the page took too long to respond.');
    if (err.message.startsWith('Page') || err.message.startsWith('Server')) throw err;
    if (err.message.startsWith('Request')) throw err;
    if (err.message === 'Failed to fetch' || err.message.includes('NetworkError') || err.message.includes('net::ERR_')) {
      throw new Error('Could not reach the page — no internet connection or DNS error. Check the URL and your connection.');
    }
    throw new Error('Failed to load page: ' + err.message);
  }
}

async function fetchFileContent(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error('Local file not found or inaccessible.\nEnsure "Allow access to file URLs" is checked in chrome://extensions for MirrorForge.\n\nPath: ' + url.replace('file://', ''));
    }
    const html = await response.text();
    if (!html || html.length < 50) {
      throw new Error('Local file is empty or contains no meaningful content.');
    }
    return parseHTMLContent(html, url);
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Timed out reading the local file.');
    if (err.message.startsWith('Local')) throw err;
    if (err.message.includes('Failed to fetch')) {
      throw new Error('Cannot access local files. Enable "Allow access to file URLs" in chrome://extensions → MirrorForge → Details.');
    }
    throw new Error('Failed to load local file: ' + err.message);
  }
}

/* ============================================================
   HIDDEN TAB SCRAPING (creates a minimized invisible window —
   waits for full JS rendering, scrapes, closes window)
   ============================================================ */
async function scrapeUrlViaTab(url) {
  let winId = null;
  let tabId = null;
  try {
    // Create a minimized window — user never sees it appear
    const win = await chrome.windows.create({ url, state: 'minimized', type: 'normal' });
    winId = win.id;
    tabId = win.tabs[0].id;

    // Wait for the page to fully load (status === 'complete')
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve(); // Proceed anyway after timeout
      }, 20000);

      const onUpdated = (id, info) => {
        if (id === tabId && info.status === 'complete') {
          clearTimeout(timeout);
          chrome.tabs.onUpdated.removeListener(onUpdated);
          // Extra 1.5s delay for SPA JavaScript to render the real content
          setTimeout(resolve, 1500);
        }
      };
      chrome.tabs.onUpdated.addListener(onUpdated);
    });

    // The content script is already injected via manifest (http/https),
    // so send the scrape message directly
    const result = await chrome.tabs.sendMessage(tabId, {
      type: 'MIRRORFORGE_SCRAPE',
      url: url,
    });

    if (!result || result.error) {
      throw new Error(result?.error || 'Scraper returned no data');
    }

    return {
      content: result.content || '',
      visualReport: result.visualReport || '',
      strippedHTML: result.strippedHTML || '',
      images: result.images || [],
      links: result.links || [],
      navItems: result.navItems || [],
      siteStructure: result.siteStructure || null,
      title: (result.metadata && result.metadata.title) || '',
    };
  } catch (err) {
    console.warn('[MirrorForge] tab scrape failed:', err.message);
    // Fallback: fetch raw HTML (won't have JS rendering, but better than nothing)
    console.log('[MirrorForge] falling back to direct fetch for:', url);
    return fetchUrlContent(url);
  } finally {
    // Always close the hidden window
    if (winId !== null) {
      chrome.windows.remove(winId).catch(() => {});
    }
  }
}

function parseHTMLContent(html, baseUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Resolve relative URLs
  const resolve = (href) => {
    if (!href) return '';
    try { return new URL(href, baseUrl).href; } catch { return href; }
  };

  // Clean text helper
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // Metadata
  const title = doc.title || '';

  // Text content — extract from visible text elements
  let textContent = '';
  try {
    const textEls = doc.querySelectorAll('p, li, td, th, blockquote, figcaption, dt, dd, h1, h2, h3, h4, h5, h6');
    const texts = [];
    textEls.forEach(el => {
      const t = clean(el.textContent);
      if (t && t.length > 10) texts.push(t);
    });
    textContent = texts.join('\n').substring(0, 15000);
  } catch (e) { textContent = doc.body?.textContent?.substring(0, 15000) || ''; }

  // Headings structure
  const headings = [];
  try {
    doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
      const t = clean(h.textContent);
      if (t) headings.push({ level: h.tagName.toLowerCase(), text: t });
    });
  } catch (e) {}

  // Links
  const links = [];
  try {
    doc.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        links.push({ text: clean(a.textContent), href });
      }
    });
  } catch (e) {}

  // Images
  const images = [];
  try {
    doc.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        images.push({ alt: img.getAttribute('alt') || '', src: resolve(src) });
      }
    });
  } catch (e) {}

  // Buttons
  const buttons = [];
  try {
    doc.querySelectorAll('button, [role="button"]').forEach(b => {
      const t = clean(b.textContent);
      if (t) buttons.push({ text: t, type: b.type || 'button' });
    });
  } catch (e) {}

  // Forms
  const forms = [];
  try {
    doc.querySelectorAll('form').forEach(f => {
      const inputs = [];
      f.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(inp => {
        inputs.push({ type: inp.type || inp.tagName.toLowerCase(), name: inp.name || '', placeholder: inp.placeholder || '' });
      });
      forms.push({ action: f.action || '', method: f.method || 'get', inputs });
    });
  } catch (e) {}

  // Navigation
  const navItems = [];
  try {
    doc.querySelectorAll('nav a, header a, [role="navigation"] a').forEach(a => {
      const t = clean(a.textContent);
      if (t) navItems.push(t);
    });
  } catch (e) {}

  // Stripped HTML — clean clone of body, no scripts
  let strippedHTML = '';
  try {
    const clone = doc.body.cloneNode(true);
    clone.querySelectorAll('script, noscript, iframe, style, link, meta').forEach(el => el.remove());
    clone.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
      });
    });
    strippedHTML = clone.innerHTML.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ');
    if (strippedHTML.length > 30000) strippedHTML = strippedHTML.substring(0, 30000) + '\n<!-- TRUNCATED -->';
  } catch (e) {}

  // Visual report — inline styles and embedded style blocks
  let visualReport = '';
  try {
    const lines = [];
    const vw = 1440; // assumed desktop viewport
    const vh = 900;
    lines.push('/* VIEWPORT: ' + vw + 'x' + vh + ' */');
    lines.push('');

    // Extract inline styles from visible elements
    const allEls = doc.querySelectorAll('body *');
    let count = 0;
    for (const el of allEls) {
      if (count > 80) break;
      const tag = el.tagName.toLowerCase();
      if (['script','style','noscript','iframe','link','meta'].includes(tag)) continue;
      // Build a selector
      let sel = tag;
      if (el.id) sel += '#' + el.id;
      else if (el.className && typeof el.className === 'string') {
        const cls = el.className.trim().split(/\s+/).filter(c => c && !c.startsWith('ng-') && !c.startsWith('_')).slice(0, 2).join('.');
        if (cls) sel += '.' + cls;
      }
      // Collect visible styles from inline style attribute
      const inline = el.getAttribute('style');
      const cssRules = [];
      if (inline && inline.length > 2) {
        inline.split(';').forEach(decl => {
          const d = decl.trim();
          if (d) cssRules.push('  ' + d + ';');
        });
      }
      // Also check width/height/align attributes
      const w = el.getAttribute('width') || '';
      const h = el.getAttribute('height') || '';
      if (w && !inline?.includes('width')) cssRules.push('  width: ' + w + ';');
      if (h && !inline?.includes('height')) cssRules.push('  height: ' + h + ';');

      if (cssRules.length > 0) {
        const textComment = clean(el.textContent).substring(0, 50);
        lines.push('/* ' + sel + (textComment ? '  /* "' + textComment + '" */' : '') + ' */');
        lines.push(sel + ' {\n' + cssRules.join('\n') + '\n}');
        count++;
      }
    }

    // Extract embedded <style> block content
    doc.querySelectorAll('style').forEach(styleEl => {
      const cssText = styleEl.textContent.trim();
      if (cssText && cssText.length > 20) {
        lines.push('');
        lines.push('/* Embedded stylesheet */');
        lines.push(cssText.substring(0, 1000) + (cssText.length > 1000 ? '\n/* ... truncated */' : ''));
      }
    });

    // Color palette summary
    lines.push('');
    lines.push('/* COLOR PALETTE */');
    const colors = new Set();
    try {
      doc.querySelectorAll('[style]').forEach(el => {
        const s = el.getAttribute('style') || '';
        ['color:', 'background:', 'background-color:', 'border-color:'].forEach(prop => {
          const idx = s.indexOf(prop);
          if (idx >= 0) {
            const val = s.substring(idx + prop.length).split(';')[0].trim();
            if (val && val.startsWith('#')) colors.add(val);
            else if (val && val.startsWith('rgb')) colors.add(val);
          }
        });
      });
    } catch (e) {}
    for (const c of [...colors].slice(0, 20)) lines.push('/*   ' + c + ' */');

    // Images
    lines.push('');
    lines.push('/* IMAGES */');
    for (const img of images.slice(0, 20)) {
      lines.push('/*   ' + (img.alt || 'img') + ' : ' + img.src + ' */');
    }

    visualReport = lines.join('\n');
  } catch (e) {}

  return {
    content: textContent,
    visualReport,
    strippedHTML,
    title,
    metadata: { url: baseUrl, title },
    headings,
    links: links.slice(0, 100),
    images: images.slice(0, 50),
    buttons: [...new Set(buttons)].slice(0, 30),
    forms,
    navItems: [...new Set(navItems)].slice(0, 30),
    siteStructure: null,
  };
}

  // Laser
  const overlay = dom.laserOverlay();
  if (overlay) {
    overlay.classList.remove('active');
    void overlay.offsetWidth;
    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active'), 1600);
  }
  await sleep(1400);

  const prompt = buildFinalPrompt({
    mode: state.mode,
    source: state.source,
    rawInput,
    scrapedContent: scraped,
    visualReport,
    strippedHTML,
    pageImages,
    pageTitle,
    pageUrl,
    detailLevel: state.detailLevel || 5,
    framework: state.framework,
    css: state.css,
    model: state.model,
    cloneScope: state.cloneScope,
    pageLinks,
    pageNavItems,
    siteStructure,
  });

  state.lastOutput = prompt;

  const estimatedTokens = estimateTokens(prompt);

  // Reveal output
  dom.output.classList.add('revealed');
  dom.outputText.textContent = '';
  dom.outputText.classList.remove('generated');
  void dom.outputText.offsetWidth; // force reflow
  await typeText(dom.outputText, prompt, 10);

  // Glow effect: flash indigo border then fade back
  dom.outputText.classList.add('generated');
  setTimeout(() => dom.outputText.classList.remove('generated'), 2200);

  updateTokenDisplay(estimatedTokens);
  dom.copyBtn.classList.remove('copied');

  // Add to history
  addToHistory(prompt, estimatedTokens);

  // Save output state
  debouncedSave.flush && debouncedSave.flush();
  saveState();

  showToast('Master prompt forged!', 'success');
}

/* ============================================================
   COPY
   ============================================================ */
function bindCopyBtn() {
  dom.copyBtn.addEventListener('click', async () => {
    const text = dom.outputText.textContent || state.lastOutput;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e2) {
        showToast('Could not copy. Select the text manually.', 'error');
        return;
      }
    }
    dom.copyBtn.classList.add('copied');
    showToast('Prompt copied to clipboard!', 'success');
    setTimeout(() => dom.copyBtn.classList.remove('copied'), 1500);
  });
}

/* ============================================================
   SCAN TAB
   ============================================================ */
function bindScanBtn() {
  dom.scanBtn.addEventListener('click', async () => {
    try {
      const tab = await getCurrentTab();
      if (tab && tab.url) {
        dom.urlInput.value = tab.url;
        saveState();
        showToast('Tab URL loaded. Click Forge Prompt.', 'info');
      } else {
        showToast('Could not read the current tab.', 'error');
      }
    } catch (err) {
      showToast('Failed to access the current tab.', 'error');
    }
  });
}

/* ============================================================
   DRAG & DROP
   ============================================================ */
function bindDragDrop() {
  const targets = [dom.urlInput, dom.textInput].filter(Boolean);
  targets.forEach(el => {
    const wrap = el.closest('.url-row') || el;
    el.addEventListener('dragover', e => { e.preventDefault(); wrap.classList.add('drag-over'); });
    el.addEventListener('dragleave', () => wrap.classList.remove('drag-over'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      wrap.classList.remove('drag-over');
      const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain') || '';
      if (url) {
        dom.urlInput.value = url;
        saveState();
        showToast('URL dropped. Click Forge Prompt.', 'info');
      }
    });
  });
}

/* ============================================================
   CTRL+ENTER SHORTCUT
   ============================================================ */
function bindCtrlEnter() {
  const inputs = [dom.urlInput, dom.textInput].filter(Boolean);
  inputs.forEach(el => {
    el.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleForge();
      }
    });
  });
}

/* ============================================================
   CHAR COUNTS
   ============================================================ */
function bindCharCounts() {
  if (dom.urlInput) dom.urlInput.addEventListener('input', debouncedSave);
}

/* ============================================================
   HISTORY
   ============================================================ */
function bindHistoryToggle() {
  const toggle = dom.historyToggle();
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    dom.historyList.classList.toggle('open');
  });
}

function addToHistory(prompt, tokens) {
  state.history.unshift({ prompt, tokens, timestamp: Date.now() });
  if (state.history.length > MAX_HISTORY) state.history = state.history.slice(0, MAX_HISTORY);
  saveState();
  renderHistory();
}

function renderHistory() {
  if (!dom.history || !dom.historyList) return;
  if (state.history.length === 0) {
    dom.history.style.display = 'none';
    return;
  }
  dom.history.style.display = 'block';
  dom.historyList.innerHTML = '';
  state.history.forEach((entry, i) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    const preview = entry.prompt.substring(0, 80).replace(/\n/g, ' ') + (entry.prompt.length > 80 ? '...' : '');
    const time = new Date(entry.timestamp);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    item.innerHTML = `
      <span class="history-item-text" title="${escapeHtml(entry.prompt.substring(0, 200))}">${escapeHtml(preview)}</span>
      <span class="history-item-meta">~${entry.tokens.toLocaleString()} tok · ${timeStr}</span>
    `;
    item.addEventListener('click', () => {
      dom.outputText.textContent = entry.prompt;
      dom.output.classList.add('revealed');
      const tokens = entry.tokens || estimateTokens(entry.prompt);
      updateTokenDisplay(tokens);
      dom.copyBtn.classList.remove('copied');
      state.lastOutput = entry.prompt;
      showToast('Restored from history.', 'info');
    });
    dom.historyList.appendChild(item);
  });
}

/* ============================================================
   DOWNLOAD
   ============================================================ */
function bindDownload() {
  if (!dom.downloadBtn) return;
  dom.downloadBtn.addEventListener('click', () => {
    const text = dom.outputText.textContent || state.lastOutput;
    if (!text) { showToast('Generate a prompt first.', 'info'); return; }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mirrorforge-prompt.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Prompt downloaded!', 'success');
  });
}

/* ============================================================
   SETTINGS — PAGE TRANSITION
   Slides main content left to reveal the settings page.
   ============================================================ */
function bindSettings() {
  if (!dom.settingsBtn) return;
  dom.settingsBtn.addEventListener('click', () => {
    const container = document.getElementById('pageContainer');
    if (!container) return;
    container.classList.add('settings-open');
    dom.settingsBtn.classList.add('active');
  });
}

function bindSettingsBack() {
  const backBtn = document.getElementById('settingsBackBtn');
  if (!backBtn) return;
  backBtn.addEventListener('click', () => {
    const container = document.getElementById('pageContainer');
    if (!container) return;
    container.classList.remove('settings-open');
    dom.settingsBtn.classList.remove('active');
  });
}

function getDetailLabel(val) {
  if (val <= 2) return 'Basic Skeleton';
  if (val <= 4) return 'Standard Stack';
  if (val <= 6) return 'Enhanced';
  if (val <= 8) return 'High Precision';
  return 'Max Precision Clone';
}
function getDetailTooltip(val) {
  const descs = {
    1: 'Minimal: bare HTML, basic CSS, core functionality',
    2: 'Light: compact spec with structure and styling',
    3: 'Standard: design system, responsive, dark mode',
    4: 'Standard+: full spec with extra style rules',
    5: 'Enhanced: full data, no truncation, balanced rules',
    6: 'Enhanced+: more CSS props, interactive states',
    7: 'High Precision: animations, fonts, form validation',
    8: 'High Precision+: all states, keyframes, accessibility',
    9: 'Max Precision: pixel-perfect, all effects, full ARIA',
    10: 'Max Precision Clone: 1:1 replica with production polish',
  };
  return descs[val] || 'Enhanced: full data with standard rules';
}

function bindDetailSlider() {
  if (!dom.detailSlider) return;
  dom.detailSlider.addEventListener('input', () => {
    const val = parseInt(dom.detailSlider.value, 10);
    state.detailLevel = val;
    if (dom.detailLabel) dom.detailLabel.textContent = getDetailLabel(val) + ' (' + val + '/10)';
    if (dom.detailTooltip) dom.detailTooltip.textContent = getDetailTooltip(val);
    // Update slider track fill percentage
    const pct = ((val - 1) / 9) * 100;
    dom.detailSlider.style.background = 'linear-gradient(to right, var(--accent) ' + pct + '%, #2A2A2A ' + pct + '%)';
    debouncedSave();
    // Recalculate token count if output is visible
    if (state.lastOutput) {
      const tokens = estimateTokens(state.lastOutput);
      updateTokenDisplay(tokens);
    }
  });
  // Set initial label from saved state
  const initVal = parseInt(dom.detailSlider.value, 10);
  if (dom.detailLabel) dom.detailLabel.textContent = getDetailLabel(initVal) + ' (' + initVal + '/10)';
  if (dom.detailTooltip) dom.detailTooltip.textContent = getDetailTooltip(initVal);
  // Set initial track fill
  const initPct = ((initVal - 1) / 9) * 100;
  dom.detailSlider.style.background = 'linear-gradient(to right, var(--accent) ' + initPct + '%, #2A2A2A ' + initPct + '%)';
}

/* ============================================================
   THEME SYSTEM
   ============================================================ */
function bindThemeSelector() {
  const themeBtns = document.querySelectorAll('.theme-option');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      if (theme === 'custom') {
        const panel = dom.customColorPanel;
        if (panel) panel.style.display = 'block';
        return;
      }
      if (dom.customColorPanel) dom.customColorPanel.style.display = 'none';
      themeBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-checked', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      state.theme = theme;
      state.customColors = null;
      applyTheme(theme);
      saveState();
    });
  });
}

function applyTheme(theme) {
  const colors = THEMES[theme];
  if (!colors) return;
  const root = document.documentElement;
  for (const [prop, val] of Object.entries(colors)) {
    root.style.setProperty(prop, val);
  }
  // Update slider track fill to use new accent
  const val = parseInt(dom.detailSlider?.value || '5', 10);
  const pct = ((val - 1) / 9) * 100;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function lighten(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
  const b = Math.min(255, (num & 0x0000FF) + amount);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function darken(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
  const b = Math.max(0, (num & 0x0000FF) - amount);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function applyCustomColors(colors) {
  if (!colors) return;
  const root = document.documentElement;
  const accent = colors.accent || '#3B82F6';
  root.style.setProperty('--bg-primary', colors.bg || '#0A0A0A');
  root.style.setProperty('--bg-surface', colors.surface || '#121212');
  root.style.setProperty('--bg-elevated', lighten(colors.surface || '#121212', 8));
  root.style.setProperty('--bg-inset', darken(colors.bg || '#0A0A0A', 4));
  root.style.setProperty('--text-primary', colors.text || '#E8E8E8');
  root.style.setProperty('--text-secondary', '#9CA3AF');
  root.style.setProperty('--text-muted', '#4B5563');
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-soft', hexToRgba(accent, 0.15));
  root.style.setProperty('--accent-border', hexToRgba(accent, 0.3));
  root.style.setProperty('--accent-shadow', hexToRgba(accent, 0.25));
  root.style.setProperty('--border', '#1E1E1E');
  root.style.setProperty('--border-hover', '#333');
  root.style.setProperty('--border-accent', accent);
  // Update slider track fill
  const val = parseInt(dom.detailSlider?.value || '5', 10);
  const pct = ((val - 1) / 9) * 100;
  if (dom.detailSlider) {
    dom.detailSlider.style.background = 'linear-gradient(to right, var(--accent) ' + pct + '%, #2A2A2A ' + pct + '%)';
  }
}

function bindCustomColor() {
  if (!dom.applyCustomBtn) return;
  dom.applyCustomBtn.addEventListener('click', () => {
    const colors = {
      bg: dom.colorBg?.value || '#0A0A0A',
      accent: dom.colorAccent?.value || '#3B82F6',
      text: dom.colorText?.value || '#E8E8E8',
      surface: dom.colorSurface?.value || '#121212',
    };
    state.theme = 'custom';
    state.customColors = colors;
    // Deselect all theme preset buttons
    document.querySelectorAll('.theme-option').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
    applyCustomColors(colors);
    saveState();
  });
}

/* ============================================================
   URL VALIDATION
   ============================================================ */
function bindUrlValidation() {
  if (!dom.urlInput || !dom.urlIndicator || !dom.urlError) return;
  dom.urlInput.addEventListener('input', () => {
    const val = dom.urlInput.value.trim();
    const row = dom.urlInput.closest('.url-row');
    if (!val) {
      dom.urlIndicator.className = 'url-indicator';
      if (row) row.classList.remove('has-error', 'is-valid');
      dom.urlError.style.display = 'none';
      return;
    }
    if (isValidUrl(val)) {
      dom.urlIndicator.className = 'url-indicator valid';
      if (row) { row.classList.remove('has-error'); row.classList.add('is-valid'); }
      dom.urlError.style.display = 'none';
    } else {
      dom.urlIndicator.className = 'url-indicator invalid';
      if (row) { row.classList.remove('is-valid'); row.classList.add('has-error'); }
      dom.urlError.style.display = 'block';
    }
    debouncedSave();
  });
  // Also validate on paste
  dom.urlInput.addEventListener('paste', () => {
    setTimeout(() => dom.urlInput.dispatchEvent(new Event('input')), 50);
  });
}

/* ============================================================
   TECH STACK — CUSTOM DROPDOWNS
   ============================================================ */
function bindTechStack() {
  document.querySelectorAll('.dropdown').forEach(wrap => {
    const trigger = wrap.querySelector('.dropdown-trigger');
    const menu = wrap.querySelector('.dropdown-menu');
    const options = wrap.querySelectorAll('.dropdown-option');
    const name = wrap.dataset.name; // 'framework', 'css', or 'model'
    const selectMap = { framework: 'frameworkSelect', css: 'cssSelect', model: 'modelSelect' };
    const selectId = selectMap[name];
    const hiddenSelect = document.getElementById(selectId);

    // Toggle
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        wrap.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('select-open');
      }
    });

    // Select option
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.dataset.value;
        const label = opt.textContent;
        // Update trigger label
        wrap.querySelector('.dropdown-label').textContent = label;
        // Update hidden select
        if (hiddenSelect) {
          hiddenSelect.value = val;
          hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // Update selected state
        options.forEach(o => { o.classList.remove('selected'); o.setAttribute('aria-selected', 'false'); });
        opt.classList.add('selected');
        opt.setAttribute('aria-selected', 'true');
        // Close
        closeAllDropdowns();
        // Update state
        if (name === 'framework') state.framework = val;
        else if (name === 'css') state.css = val;
        else if (name === 'model') {
          state.model = val;
          updateSystemBadge();
        }
        debouncedSave();
      });
    });

    // Update label from saved state on init
    if (hiddenSelect && hiddenSelect.value) {
      const savedVal = hiddenSelect.value;
      const matched = wrap.querySelector(`.dropdown-option[data-value="${savedVal}"]`);
      if (matched) {
        wrap.querySelector('.dropdown-label').textContent = matched.textContent;
        options.forEach(o => { o.classList.remove('selected'); o.setAttribute('aria-selected', 'false'); });
        matched.classList.add('selected');
        matched.setAttribute('aria-selected', 'true');
      }
    }
  });

  // Close all on outside click
  document.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllDropdowns();
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown.open').forEach(w => {
    w.classList.remove('open');
    w.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
  });
  document.body.classList.remove('select-open');
}

function updateSystemBadge() {
  const badge = dom.footerBadge;
  if (!badge) return;
  badge.textContent = 'Always improving · made with care';
}

/* ============================================================
   AUTO-FILL URL ON OPEN
   ============================================================ */
async function autoFillUrl() {
  if (state.source !== 'url') return;
  if (dom.urlInput.value.trim()) return; // Already has content
  try {
    const tab = await getCurrentTab();
    if (tab && tab.url && (tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
      dom.urlInput.value = tab.url;
      saveState();
    }
  } catch (err) {
    // Silently ignore — auto-fill is a convenience, not critical
  }
}

/* ============================================================
   STATE PERSISTENCE
   ============================================================ */
function debounce(fn, ms) {
  let timer;
  function wrapped() {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  }
  wrapped.flush = function() {
    clearTimeout(timer);
    fn();
  };
  return wrapped;
}

const debouncedSave = debounce(saveState, 300);

function saveState() {
  chrome.storage.local.set({
    mirrorForgeMode: state.mode,
    mirrorForgeSource: state.source,
    mirrorForgeUrlInput: dom.urlInput.value || '',
    mirrorForgeTextInput: dom.textInput.value || '',
    mirrorForgeLastOutput: state.lastOutput || '',
    mirrorForgeLastOutputTokens: dom.tokenCount ? dom.tokenCount.textContent : '0 tokens',
    mirrorForgeHistory: state.history || [],
    mirrorForgeDetailLevel: state.detailLevel || 5,
    mirrorForgeFramework: state.framework || 'auto',
    mirrorForgeCss: state.css || 'auto',
    mirrorForgeModel: state.model || 'auto',
    mirrorForgeTheme: state.theme || 'midnight',
    mirrorForgeCustomColors: state.customColors,
    mirrorForgeCloneScope: state.cloneScope || 'single',
  }).catch(() => {});
}

function loadFullState() {
  return new Promise(resolve => {
    // Try local storage first for cross-restart persistence
    chrome.storage.local.get([
      'mirrorForgeMode',
      'mirrorForgeSource',
      'mirrorForgeUrlInput',
      'mirrorForgeTextInput',
      'mirrorForgeLastOutput',
      'mirrorForgeLastOutputTokens',
      'mirrorForgeHistory',
      'mirrorForgeDetailLevel',
      'mirrorForgeFramework',
      'mirrorForgeCss',
      'mirrorForgeModel',
      'mirrorForgeTheme',
      'mirrorForgeCustomColors',
      'mirrorForgeCloneScope',
    ], items => {
      if (chrome.runtime.lastError || !items.mirrorForgeMode) {
        // Fallback: session storage (backward compat with old saves)
        chrome.storage.session.get([
          'mirrorForgeMode',
          'mirrorForgeSource',
          'mirrorForgeUrlInput',
          'mirrorForgeTextInput',
          'mirrorForgeLastOutput',
          'mirrorForgeLastOutputTokens',
          'mirrorForgeHistory',
          'mirrorForgeDetailLevel',
          'mirrorForgeFramework',
          'mirrorForgeCss',
          'mirrorForgeModel',
          'mirrorForgeTheme',
          'mirrorForgeCustomColors',
          'mirrorForgeCloneScope',
        ], sessionItems => {
          if (!chrome.runtime.lastError && sessionItems && sessionItems.mirrorForgeMode) {
            restoreFromStorage(sessionItems);
            // Migrate to local storage for future loads
            chrome.storage.local.set(sessionItems).catch(() => {});
          }
          updateSystemBadge();
          resolve();
        });
        return;
      }
      restoreFromStorage(items);
      updateSystemBadge();
      resolve();
    });
  });
}

/* ============================================================
   RESTORE STATE FROM STORAGE
   ============================================================ */
function restoreFromStorage(items) {
  // Restore mode + source via unified pills
  const mode = items.mirrorForgeMode || 'website';
  const source = items.mirrorForgeSource || 'url';
  const matchedPill = dom.pillBtns().find(b =>
    b.dataset.mode === mode && b.dataset.source === source
  );
  if (matchedPill) {
    dom.pillBtns().forEach(b => { b.classList.remove('active'); b.setAttribute('aria-checked', 'false'); });
    matchedPill.classList.add('active');
    matchedPill.setAttribute('aria-checked', 'true');
    state.mode = mode;
    state.source = source;
    const panel = source === 'url' ? dom.panelUrl : dom.panelText;
    $$('.input-panel').forEach(p => p.classList.remove('active'));
    if (panel) panel.classList.add('active');
    dom.urlInput.disabled = source !== 'url';
    dom.textInput.disabled = source !== 'text';
  }

  // Restore clone scope
  const scope = items.mirrorForgeCloneScope || 'single';
  state.cloneScope = scope;
  const matchedScope = dom.cloneScopeBtns().find(b => b.dataset.scope === scope);
  if (matchedScope) {
    dom.cloneScopeBtns().forEach(b => { b.classList.remove('active'); b.setAttribute('aria-checked', 'false'); });
    matchedScope.classList.add('active');
    matchedScope.setAttribute('aria-checked', 'true');
  }
  if (dom.cloneScopeHint) {
    dom.cloneScopeHint.textContent = scope === 'full'
      ? 'Site architecture will be extracted from navigation links'
      : 'Cloning current page only — use Full Site for multi-page output';
  }
  // Show/hide clone scope row
  if (dom.cloneScopeRow) {
    const showScope = state.mode === 'website' && state.source === 'url';
    dom.cloneScopeRow.style.display = showScope ? 'block' : 'none';
  }

  // Restore input values
  if (items.mirrorForgeUrlInput) dom.urlInput.value = items.mirrorForgeUrlInput;
  if (items.mirrorForgeTextInput) {
    dom.textInput.value = items.mirrorForgeTextInput;
  }

  // Restore last output
  if (items.mirrorForgeLastOutput) {
    dom.outputText.textContent = items.mirrorForgeLastOutput;
    dom.output.classList.add('revealed');
    if (items.mirrorForgeLastOutputTokens) {
      dom.tokenCount.textContent = items.mirrorForgeLastOutputTokens;
    } else {
      const chars = items.mirrorForgeLastOutput.length;
      dom.tokenCount.textContent = '~' + Math.max(1, Math.round(chars / 4)).toLocaleString() + ' tokens';
    }
    state.lastOutput = items.mirrorForgeLastOutput;
  }

  // Restore history
  if (items.mirrorForgeHistory && Array.isArray(items.mirrorForgeHistory)) {
    state.history = items.mirrorForgeHistory;
    renderHistory();
  }

  // Restore detail level (map old 1-3 values to 1-10 scale)
  let level = items.mirrorForgeDetailLevel || 5;
  if (level <= 3) level = [0, 2, 5, 9][level] || 5; // map old 1→2, 2→5, 3→9
  state.detailLevel = level;
  if (dom.detailSlider) dom.detailSlider.value = String(level);
  if (dom.detailLabel) dom.detailLabel.textContent = getDetailLabel(level) + ' (' + level + '/10)';
  if (dom.detailTooltip) dom.detailTooltip.textContent = getDetailTooltip(level);

  // Restore framework/css (triggers custom dropdown UI via bindTechStack)
  if (items.mirrorForgeFramework) {
    state.framework = items.mirrorForgeFramework;
    if (dom.frameworkSelect) {
      dom.frameworkSelect.value = items.mirrorForgeFramework;
      dom.frameworkSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  if (items.mirrorForgeCss) {
    state.css = items.mirrorForgeCss;
    if (dom.cssSelect) {
      dom.cssSelect.value = items.mirrorForgeCss;
      dom.cssSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Restore model
  if (items.mirrorForgeModel) {
    state.model = items.mirrorForgeModel;
    if (dom.modelSelect) {
      dom.modelSelect.value = items.mirrorForgeModel;
      dom.modelSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Restore theme
  const savedTheme = items.mirrorForgeTheme || 'midnight';
  state.theme = savedTheme;
  // Sync theme button active state in settings
  document.querySelectorAll('.theme-option').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-checked', 'false');
  });
  const themeBtn = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
  if (themeBtn && savedTheme !== 'custom') {
    themeBtn.classList.add('active');
    themeBtn.setAttribute('aria-checked', 'true');
  }
  if (savedTheme !== 'midnight') {
    if (savedTheme === 'custom' && items.mirrorForgeCustomColors) {
      state.customColors = items.mirrorForgeCustomColors;
      applyCustomColors(items.mirrorForgeCustomColors);
    } else {
      applyTheme(savedTheme);
    }
  }

  // Set initial slider track fill based on restored level
  if (dom.detailSlider) {
    const pct = ((level - 1) / 9) * 100;
    dom.detailSlider.style.background = 'linear-gradient(to right, var(--accent) ' + pct + '%, #2A2A2A ' + pct + '%)';
  }
}

/* ============================================================
   HELPERS
   ============================================================ */
function getCurrentTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const err = chrome.runtime.lastError;
      if (err) { reject(new Error(err.message)); return; }
      resolve(tabs && tabs.length > 0 ? tabs[0] : null);
    });
  });
}

function isValidUrl(str) {
  try { const u = new URL(str); return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'file:'; }
  catch { return false; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================================
   ERROR BANNER
   ============================================================ */
function showError(msg) {
  if (!dom.errorBanner || !dom.errorText) return;
  dom.errorText.textContent = msg;
  dom.errorBanner.style.display = 'flex';
}
function hideError() {
  if (!dom.errorBanner) return;
  dom.errorBanner.style.display = 'none';
}

/* ============================================================
   TOKEN ESTIMATION
   ============================================================ */
function estimateTokens(text) {
  return Math.max(1, Math.round(text.length / 4));
}

function updateTokenDisplay(count) {
  if (!dom.tokenCount) return;
  dom.tokenCount.textContent = '~' + count.toLocaleString() + ' tokens';
  dom.tokenCount.classList.remove('warning', 'overlimit');
  if (count > 7000) dom.tokenCount.classList.add('warning');
  if (count > 12000) dom.tokenCount.classList.replace('warning', 'overlimit');
}

/* ============================================================
   TYPEWRITER EFFECT
   ============================================================ */
function typeText(el, text, speed) {
  return new Promise(resolve => {
    if (!el || !text) { resolve(); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; resolve(); return; }
    el.textContent = '';
    let index = 0, last = 0;
    const total = text.length;
    const target = Math.min(total * (speed || 10), 3000);
    const perChar = target / total;
    const frame = ts => {
      if (!last) last = ts;
      const n = Math.max(1, Math.floor((ts - last) / perChar));
      const end = Math.min(index + n, total);
      if (end > index) { el.textContent = text.substring(0, end); index = end; }
      last = ts;
      if (index < total) requestAnimationFrame(frame);
      else { el.textContent = text; el.scrollTop = 0; resolve(); }
    };
    requestAnimationFrame(frame);
  });
}

/* ============================================================
   TOAST SYSTEM
   ============================================================ */
let toastTimer = null;

function showToast(message, type, duration) {
  type = type || 'info';
  duration = duration || 3000;
  const container = dom.toastContainer;
  if (!container) return;
  const existing = container.querySelector('.toast');
  if (existing) { existing.classList.add('toast-exit'); setTimeout(() => existing.remove(), 150); }
  clearTimeout(toastTimer);
  const icons = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span> ' + message;
  container.appendChild(toast);
  toastTimer = setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 150);
  }, duration);
}

/* ============================================================
   PROMPT ENGINE
   ============================================================ */
const AI_CHAT_DOMAINS = [
  'chat.deepseek.com', 'chatgpt.com', 'chat.openai.com',
  'claude.ai', 'chat.mistral.ai', 'gemini.google.com',
  'perplexity.ai', 'copilot.microsoft.com', 'chat.cohere.com',
];

function isAiChatUrl(url) {
  try {
    const u = new URL(url);
    return AI_CHAT_DOMAINS.some(d => u.hostname === d || u.hostname.endsWith('.' + d));
  } catch { return false; }
}

const MODEL_URL_MAP = {
  'claude.ai': 'claude',
  'chatgpt.com': 'gpt4o',
  'chat.openai.com': 'gpt4o',
  'chat.deepseek.com': 'deepseek',
  'gemini.google.com': 'gemini',
  'grok.com': 'grok',
  'chat.mistral.ai': 'mistral',
};

function detectModelFromUrl(url) {
  try {
    const u = new URL(url);
    for (const [domain, model] of Object.entries(MODEL_URL_MAP)) {
      if (u.hostname === domain || u.hostname.endsWith('.' + domain)) return model;
    }
  } catch {}
  return null;
}

function wrapPromptForModel(prompt, model) {
  const modelProfiles = {
    claude: {
      prepend: `<model-instructions target="claude">
You are running as Claude (Sonnet/Opus). You excel at following detailed, nuanced instructions.
- Use XML-style semantic tags for structure when organizing your response.
- Handle complex multi-step instructions in your chain-of-thought before responding.
- Prioritize nuanced, detailed implementations that respect every constraint.
- Output format: clean, well-structured code with semantic HTML and thoughtful CSS.
</model-instructions>

`,
      append: ``,
    },
    gpt4o: {
      prepend: `<model-instructions target="gpt4o">
You are running as GPT-4o / GPT-4. Structure your output with clear markdown sections and headings.
- Apply negative constraints strictly — pay close attention to "DO NOT" instructions, especially regarding emojis and placeholders.
- Use explicit structured markdown to organize your response.
- Be thorough and exhaustive in your implementation — check each requirement off as you fulfill it.
- Output format: well-organized code with clear sections and detailed CSS.
</model-instructions>

`,
      append: ``,
    },
    deepseek: {
      prepend: `<model-instructions target="deepseek">
You are running as DeepSeek. You are a code-first model that excels at precise technical implementation.
- Prioritize code correctness above all else — every selector, property, and value must be exact.
- Be explicit with CSS values — use exact colors (e.g., #0A0A0A), measurements, and values, never "computed" or "default" values.
- Take a code-first approach: correct, working code is more important than verbose explanations.
- Output format: precise, production-ready code with explicit values throughout.
</model-instructions>

`,
      append: ``,
    },
    gemini: {
      prepend: `<model-instructions target="gemini">
You are running as Gemini. Process instructions step-by-step using careful reasoning.
- Use numbered stages in your approach — break down the implementation into clear, sequential phases.
- Be explicit about file structure and organization.
- Follow a methodical process: analyze requirement -> plan structure -> implement -> verify.
- Output format: well-organized code with clear stage markers and structured reasoning.
</model-instructions>

`,
      append: ``,
    },
    grok: {
      prepend: `<model-instructions target="grok">
You are running as Grok. Be concise and precise in your implementation.
- Output only what is specified — nothing extra, no unnecessary elaboration.
- Focus on the direct ask without adding extraneous features or commentary.
- Be very specific with constraints — follow them exactly without deviation.
- Output format: lean, focused code that meets every stated requirement with minimal overhead.
</model-instructions>

`,
      append: ``,
    },
    mistral: {
      prepend: `<model-instructions target="mistral">
You are running as Mistral. Separate logic, structure, and styling into distinct, well-organized blocks.
- Be methodical in your approach — address one concern at a time.
- Maintain clear separation of concerns throughout the implementation (HTML structure / CSS styling / JS behavior).
- Be explicit about dependencies and organization.
- Output format: cleanly separated code blocks with clear boundaries between concerns.
</model-instructions>

`,
      append: ``,
    },
    generic: {
      prepend: `<model-instructions target="generic">
You are running on a modern AI model. Use your best judgment for structure and implementation.
- Follow the specification exactly — build every feature and section described.
- Prioritize correctness, completeness, and clean code.
- Output format: well-organized code that any modern model would produce.
</model-instructions>

`,
      append: ``,
    },
  };

  const profile = modelProfiles[model] || modelProfiles.generic;
  return profile.prepend + prompt + profile.append;
}

function buildFinalPrompt(opts) {
  let analysis = '';
  if (opts.source === 'url') {
    if (isAiChatUrl(opts.rawInput)) {
      analysis = analyzeAiChatUrl(opts.rawInput, opts.scrapedContent, opts.pageTitle, opts.pageUrl);
    } else {
      analysis = analyzeFromUrl(opts.rawInput, opts.scrapedContent, opts.pageTitle, opts.pageUrl);
    }
  } else if (opts.source === 'text') {
    analysis = analyzeFromText(opts.rawInput);
  }
  const basePrompt = assembleMasterPrompt(analysis, opts.mode, opts.visualReport, opts.pageTitle, opts.pageUrl, opts.strippedHTML, opts.pageImages, opts.source, opts.detailLevel, opts.framework, opts.css, isAiChatUrl(opts.rawInput || ''), opts.cloneScope, opts.pageLinks || [], opts.pageNavItems || [], opts.siteStructure || null);

  // Resolve model: auto -> detect from URL or default to balanced
  let resolvedModel = opts.model || 'auto';
  if (resolvedModel === 'auto') {
    const detected = detectModelFromUrl(opts.rawInput || '');
    resolvedModel = detected || 'generic';
  }

  return wrapPromptForModel(basePrompt, resolvedModel);
}

function analyzeFromUrl(url, scraped, title, pageUrl) {
  const lines = [];
  lines.push('## SOURCE TARGET');
  lines.push('- URL: ' + (pageUrl || url));
  lines.push('- Title: ' + (title || 'Unknown'));
  lines.push('');
  if (scraped && scraped.length > 50) {
    lines.push('## SCRAPED CONTENT');
    lines.push(scraped.substring(0, 50000));
    lines.push('');
  } else {
    lines.push('## SCRAPED CONTENT');
    lines.push('(No significant content extracted — the page may be JS-rendered, behind auth, or a restricted browser page.)');
    lines.push('');
  }
  return lines.join('\n');
}

function analyzeFromText(text) {
  const lines = [];
  lines.push('## DESCRIPTION');
  lines.push(text);
  lines.push('');
  lines.push('## INFERRED PRODUCT TYPE');
  lines.push(inferProductType(text));
  lines.push('');
  const features = extractFeatures(text);
  if (features.length) {
    lines.push('## INFERRED FEATURES / SECTIONS');
    features.forEach((f, i) => lines.push((i + 1) + '. ' + f));
    lines.push('');
  }
  return lines.join('\n');
}

function analyzeAiChatUrl(url, scraped, title, pageUrl) {
  const lines = [];
  lines.push('## AI CHAT SOURCE');
  lines.push('- URL: ' + (pageUrl || url));
  lines.push('- Title: ' + (title || 'AI Chat'));
  lines.push('');
  lines.push('## CONTEXT');
  lines.push('This is an AI-assisted chat conversation. Extract the tech stack, architecture, and implementation details discussed. Do NOT build the conversation topic — instead, document the technical decisions and code patterns shown.');
  lines.push('');
  if (scraped && scraped.length > 50) {
    lines.push('## CHAT CONTENT');
    lines.push(scraped.substring(0, 8000));
    lines.push('');
  }
  return lines.join('\n');
}

function assembleMasterPrompt(spec, mode, visualReport, pageTitle, pageUrl, strippedHTML, pageImages, source, detailLevel, framework, css, isChat, cloneScope, pageLinks, pageNavItems, siteStructure) {
  const isClone = source === 'url' || isChat;
  const isFullSite = isClone && cloneScope === 'full' && mode === 'website';
  const targetType = mode === 'website' ? 'responsive web application' : 'native mobile/desktop app';
  const targetDesc = mode === 'website' ? 'responsive web application' : 'native mobile or desktop application (usable offline, touch-optimized)';
  detailLevel = detailLevel || 5;
  const p = [];

  // --- COMMAND ---
  if (isChat) {
    p.push('Review the AI chat conversation below. Extract the implementation context, tech stack, and code patterns discussed. Then generate a detailed prompt that could be used to continue or reproduce this work.');
  } else if (isFullSite) {
    p.push('Generate a complete multi-page website that replicates the ENTIRE site at ' + pageUrl + '. This is a FULL SITE CLONE — create separate HTML pages for each identified section/route, with a shared design system, working navigation between all pages, and page-specific content matching the original site architecture.');
  } else if (isClone) {
    p.push('Generate an EXACT 1:1 HTML clone of the source ' + targetType + ' defined by the data below. This is replication, not interpretation — use every value exactly as given.');
  } else {
    p.push('Build a complete, production-ready ' + targetDesc + ' based on the description below. Follow the specification exactly — build every feature, section, and interaction described.');
  }
  p.push('');

  // --- SOURCE PAGE ---
  p.push('TITLE: ' + (pageTitle || 'Unknown'));
  p.push('URL: ' + (pageUrl || 'N/A'));
  p.push('');

  // --- TECH STACK PREFERENCE ---
  if (framework && framework !== 'auto' && !isChat) {
    p.push('FRAMEWORK: ' + frameworkLabel(framework));
    p.push('');
  }
  if (css && css !== 'auto' && !isChat) {
    p.push('CSS FRAMEWORK: ' + cssLabel(css));
    p.push('');
  }

  // --- SITE ARCHITECTURE (full-site clone only) ---
  if (isFullSite) {
    p.push('--- SITE ARCHITECTURE (' + pageUrl + ') ---');
    p.push('');
    p.push('This is the complete site structure discovered from the current page. The AI must generate ALL of these pages with consistent navigation and styling across every page.');
    p.push('');

    // Build a deduplicated page list from links
    const seenPaths = new Set();
    const pages = [];
    if (pageLinks && pageLinks.length > 0) {
      for (const link of pageLinks) {
        const href = link.href || link.resolvedUrl || '';
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;
        const text = link.text || '(link)';
        try {
          const resolved = new URL(href, pageUrl).href;
          const path = new URL(resolved).pathname;
          if (seenPaths.has(path)) continue;
          seenPaths.add(path);
          const origin = new URL(resolved).origin;
          const pageOrigin = new URL(pageUrl).origin;
          if (origin !== pageOrigin) continue; // skip external
          pages.push({ label: text, url: resolved, path });
        } catch { continue; }
      }
    }
    // Also add nav items
    if (pageNavItems && pageNavItems.length > 0) {
      for (const nav of pageNavItems) {
        const text = typeof nav === 'string' ? nav : (nav.text || '');
        const href = nav.href || nav.resolvedUrl || '';
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;
        try {
          const resolved = new URL(href, pageUrl).href;
          const path = new URL(resolved).pathname;
          if (seenPaths.has(path)) continue;
          seenPaths.add(path);
          pages.push({ label: text, url: resolved, path });
        } catch { continue; }
      }
    }

    if (pages.length > 0) {
      p.push('PAGES TO GENERATE:');
      p.push('');
      for (const pg of pages) {
        const current = pg.url === pageUrl ? '  [CURRENT PAGE]' : '';
        p.push('  - "' + (pg.label || 'page') + '"  →  ' + pg.path + current);
      }
      p.push('');
    } else {
      p.push('NOTE: No internal links were detected on the current page. Infer a reasonable site structure (home, about, features, contact, etc.) based on the page content and build a multi-page site with working navigation.');
      p.push('');
    }

    p.push('REQUIREMENTS:');
    p.push('1. SHARED LAYOUT: All pages must use identical header, footer, navigation, and design system. Extract the design language from the current page and apply it consistently across every page.');
    p.push('2. WORKING NAVIGATION: Every navigation link must navigate to the correct page. Use a single-file approach with hash-based routing (#home, #about) OR generate separate HTML files with relative links. All hrefs must work.');
    p.push('3. PAGE-SPECIFIC CONTENT: Each page must contain content relevant to its label/route. The current page should be the design reference. Subpages should have meaningful content matching their labels.');
    p.push('4. ALL INTERACTIONS: Every button, link, form, and interactive element must be functional on the appropriate page.');
    p.push('');
  }

  // --- VISUAL SPEC ---
  if (visualReport && isClone) {
    p.push('--- VISUAL SPECIFICATION (copy these CSS rules into your output) ---');
    if (detailLevel <= 2) {
      const lines = visualReport.split('\n');
      const filtered = [];
      let capture = false;
      for (const line of lines) {
        if (line.startsWith('/* VIEWPORT') || line.startsWith('/* COLOR PALETTE') || line.startsWith('/* IMAGES')) capture = true;
        if (capture) filtered.push(line);
      }
      p.push(filtered.join('\n') || visualReport.split('\n').slice(0, 15).join('\n') + '\n/* ... compact mode: element rules omitted */');
    } else {
      p.push(visualReport);
    }
    p.push('');
  }

  // --- SPECIFICATION ---
  p.push('--- SPECIFICATION ---');
  if (detailLevel <= 2 && spec.length > 3000) {
    p.push(spec.substring(0, 3000) + '\n... (truncated for compact mode)');
  } else {
    p.push(spec);
  }
  p.push('');

  // --- SOURCE HTML ---
  if (strippedHTML && detailLevel >= 3 && isClone) {
    p.push('--- SOURCE HTML (copy this DOM structure into your output — keep all classes, IDs, and nesting) ---');
    if (detailLevel <= 4 && strippedHTML.length > 15000) {
      p.push(strippedHTML.substring(0, 15000) + '\n<!-- TRUNCATED for balanced mode -->');
    } else {
      p.push(strippedHTML);
    }
    p.push('');
  }

  // --- IMAGES (for high detail levels) ---
  if (pageImages && pageImages.length > 0 && detailLevel >= 6 && isClone) {
    p.push('--- IMAGES ---');
    p.push('Every image from the source page with its URL, dimensions, and CSS properties. Use these exact URLs ' + EM + ' no placeholders, no picsum, no unsplash.');
    p.push('');
    for (let i = 0; i < Math.min(pageImages.length, 60); i++) {
      const img = pageImages[i];
      const dims = (img.w || img.cssW) ? ' (' + (img.w || img.cssW) + 'x' + (img.h || img.cssH) + ')' : '';
      const extra = [];
      if (img.objectFit && img.objectFit !== 'fill') extra.push('object-fit:' + img.objectFit);
      if (img.borderRadius && img.borderRadius !== '0px') extra.push('radius:' + img.borderRadius);
      if (img.isBackground) extra.push('background');
      if (img.backgroundRepeat) extra.push('repeat:' + img.backgroundRepeat);
      if (img.mixBlendMode && img.mixBlendMode !== 'normal') extra.push('mix:' + img.mixBlendMode);
      const tag = extra.length ? '  [' + extra.join(', ') + ']' : '';
      p.push((i + 1) + '. ' + (img.alt || '(image)').replace(/\n/g, ' ') + dims + tag);
      p.push('   URL: ' + img.src);
      if (detailLevel >= 8) {
        if (img.cssW) p.push('   CSS size: ' + img.cssW + ' x ' + img.cssH);
        if (img.opacity && img.opacity !== '1') p.push('   Opacity: ' + img.opacity);
        if (img.hasBgImage && img.hasBgImage !== 'none' && img.isBackground) p.push('   Background: ' + img.hasBgImage.substring(0, 200));
      }
      p.push('');
    }
    if (pageImages.length > 60) p.push('... and ' + (pageImages.length - 60) + ' more images');
    p.push('');
  }

  // --- RULES ---
  p.push('--- RULES ---');
  if (isChat) {
    p.push('1. DO NOT build the topic of the chat. Instead, extract technical decisions and patterns.');
    p.push('2. Generate a structured prompt that captures the architecture and code shown.');
    p.push('3. Include framework, dependencies, and tooling decisions observed.');
    p.push('4. NO EMOJIS — use inline SVG icons only.');
    p.push('5. Keep the output focused on technical implementation, not conversation summary.');
  } else if (!isClone) {
    // Text/build mode
    p.push('1. EVERYTHING FUNCTIONS: Every button needs a click handler, every link a working href, every form validates and submits. Nothing inert.');
    p.push('2. LIGHT + DARK MODE: CSS custom properties on :root, two @media (prefers-color-scheme) blocks. Use var() everywhere. 200ms transition on bg and color.');
    p.push('3. RESPONSIVE: Mobile-first, breakpoints at 480/768/1024/1440. Touch targets 44x44px minimum.');
    p.push('4. NO EMOJIS: Use inline SVG icons only. No unicode emoji characters anywhere.');
    p.push('5. EXACT IMAGES: Use the URLs from the /* IMAGES */ section. No placeholders.');
    if (detailLevel >= 8) {
      p.push('6. PRODUCTION POLISH: Loading states, error boundaries, empty states, focus management, transition animations, and keyboard accessibility throughout.');
    }
  } else if (isFullSite) {
    // Full Site Clone Rules
    p.push('FS1. SHARED DESIGN SYSTEM: Define CSS custom properties on :root for all colors, fonts, spacing, and radii. ALL pages must share the same design tokens. Every page must look like it belongs to the same site.');
    p.push('FS2. WORKING NAVIGATION: Every navigation link must navigate to the correct page. Use a single-file approach with hash-based routing (#home, #about, #features) OR generate separate HTML files with relative links between them. No broken links, no inert buttons.');
    p.push('FS3. LIGHT + DARK MODE: All colors as CSS custom properties on :root. Two @media (prefers-color-scheme) blocks. 200ms transition on bg and color. Consistent across all pages.');
    p.push('FS4. NO EMOJIS: Use inline SVG icons only. No unicode emoji characters anywhere.');
    p.push('FS5. RESPONSIVE: Mobile-first, breakpoints at 480/768/1024/1440. Touch targets 44x44px minimum. Consistent responsive behavior across all pages.');
    p.push('FS6. ALL INTERACTIONS FUNCTION: Every button, link, form, toggle, and dropdown must have working JavaScript across EVERY page. Nothing inert.');
    p.push('FS7. PAGE-SPECIFIC CONTENT: Each page must have content appropriate to its route. Use the scraped page content for the current page. For subpages, generate meaningful, realistic content matching the page label and site context -- no lorem ipsum, no placeholders.');
    p.push('FS8. ACTIVE NAV STATE: The currently viewed page must be visually indicated in the navigation (aria-current="page", highlighted link, bottom indicator). Update on route change.');
    if (detailLevel >= 8) {
      p.push('FS9. PRODUCTION POLISH: Loading states, error boundaries, empty states, smooth scroll, focus management, keyboard accessibility, reduced-motion @media query, print stylesheet -- on ALL pages.');
      p.push('FS10. SMOOTH PAGE TRANSITIONS: Add fade or slide transitions when navigating between pages for a polished single-page-app feel.');
    }
  } else if (detailLevel <= 4) {
    // Level 2 — Standard Clone Rules
    p.push('1. COPY CSS AS-IS: The visual spec contains real CSS rules extracted from the source. Copy each property declaration directly. If it says "background-color: #0A0A0A;" then your output must say "background-color: #0A0A0A;". Zero substitutions.');
    p.push('2. USE THE HTML STRUCTURE: The SOURCE HTML section is the actual DOM from the source page. Recreate this exact structure — same elements, classes, IDs, nesting, text content. Add the CSS on top of this structure.');
    p.push('3. EVERYTHING FUNCTIONS: Every <button> needs a click handler via addEventListener. Every <a> a working href. Every form validates + submits. Nothing inert or decorative.');
    p.push('4. LIGHT + DARK MODE: All colors as CSS custom properties. Two @media (prefers-color-scheme) blocks. 200ms transition on bg and color.');
    p.push('5. NO EMOJIS: Use inline SVG icons only. No unicode emoji characters in buttons, headings, lists, toasts, or notifications.');
  } else if (detailLevel <= 6) {
    // Level 3 — Enhanced Clone Rules (full data, interaction states)
    p.push('1. COPY CSS AS-IS: Zero substitutions — copy every value from the visual spec verbatim.');
    p.push('2. USE THE HTML STRUCTURE: Recreate the exact DOM — same elements, classes, IDs, nesting, text content.');
    p.push('3. EVERYTHING FUNCTIONS: All buttons, links, forms, toggles have working JS. Nothing inert.');
    p.push('4. LIGHT + DARK MODE: CSS custom properties, two @media blocks, 200ms transitions.');
    p.push('5. NO EMOJIS: Inline SVG icons only. No unicode emoji characters anywhere.');
    p.push('6. ALL INTERACTION STATES: Every interactive element defines :hover, :focus, :active, :disabled, and :focus-visible styles matching the source\'s behavior. Include cursor: pointer on clickable elements, cursor: not-allowed on disabled.');
    p.push('7. CSS ANIMATIONS & TRANSITIONS: Replicate every @keyframes block from the /* @KEYFRAMES */ section — same name, keyframe percentages, property values. Apply with correct duration, easing, delay, iteration count, and fill mode.');
    p.push('8. PRODUCTION POLISH: Loading states, error boundaries, empty states, smooth scroll, focus management, reduced-motion @media query, print stylesheet.');
  } else if (detailLevel <= 8) {
    // Level 4 — High Precision Clone Rules (animations, states, accessibility, fonts, forms)
    p.push('1. COPY CSS AS-IS: Zero substitutions — every value from the visual spec verbatim.');
    p.push('2. USE THE HTML STRUCTURE: Recreate the exact DOM — same elements, classes, IDs, nesting, text content.');
    p.push('3. EVERYTHING FUNCTIONS: All buttons, links, forms, toggles have working JS. Nothing inert.');
    p.push('4. LIGHT + DARK MODE: CSS custom properties, two @media blocks, 200ms transitions.');
    p.push('5. NO EMOJIS: Inline SVG icons only. No unicode emoji characters anywhere.');
    p.push('6. PIXEL-PERFECT POSITIONING: Every element\'s top/right/bottom/left/margin/padding MUST match the /* @(x,y,w,h) */ annotations to the pixel.');
    p.push('7. COMPLETE FONT STACK: Every font-family, weight, size, line-height, letter-spacing, and text-transform from the CSS spec. Import webfonts with @font-face, include font-display: swap.');
    p.push('8. ALL INTERACTION STATES: :hover, :focus, :active, :disabled, :focus-visible matching the source\'s behavior exactly.');
    p.push('9. CSS ANIMATIONS & TRANSITIONS: Replicate every @keyframes block — same name, percentages, values, duration, easing, delay, iteration, fill mode. No dropped or approximated keyframes.');
    p.push('10. FORM VALIDATION & BEHAVIOR: Match input types, patterns, required fields, placeholders, labels. Real client-side validation with inline error states. Disable submit until valid.');
    p.push('11. PRODUCTION POLISH: Loading skeletons, error boundaries, empty states, smooth scroll, focus management, keyboard shortcuts, reduced-motion, print stylesheet.');
  } else {
    // Level 5 (9-10) — MAX PRECISION CLONE MODE
      p.push('');
      p.push('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
      p.push('  ULTRA-PRECISION CLONE MODE (MAX DETAIL — MANDATORY: FOLLOW EVERY RULE)');
      p.push('  Every CSS value, every DOM node, every animation,');
      p.push('  every state, every pixel — replicated exactly. No approximations.');
      p.push('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
      p.push('');
      p.push('\u2500\u2500 CORE CLONE RULES (MANDATORY) \u2500\u2500');
      p.push('');
      p.push('1. COPY CSS AS-IS: The visual spec contains real CSS rules extracted from the source. Copy each property declaration directly. If it says "background-color: #0A0A0A;" then your output must say "background-color: #0A0A0A;". Zero substitutions. No fallbacks. No approximations.');
      p.push('2. USE THE HTML STRUCTURE: The SOURCE HTML section is the actual DOM from the source page. Recreate this exact structure — same elements, tags, classes, IDs, data-* attributes, nesting, text content verbatim. Add the CSS on top of this structure, not as inline styles.');
      p.push('3. EVERYTHING FUNCTIONS: Every <button> needs a click handler via addEventListener. Every <a> a working href (or href="#!" + preventDefault). Every form validates + submits. Every toggle toggles. Every select selects. Nothing inert or decorative.');
      p.push('4. LIGHT + DARK MODE: All colors as CSS custom properties on :root. Two @media (prefers-color-scheme: light/dark) blocks with ALL color vars reassigned. 200ms transition on background-color and color. Test both modes.');
      p.push('5. NO EMOJIS: Use inline SVG icons only. No unicode emoji characters in buttons, headings, labels, lists, toasts, or notifications. Replace every emoji the source uses with an inline SVG equivalent.');
      p.push('');
      p.push('\u2500\u2500 MAX PRECISION RULES (ALL MANDATORY) \u2500\u2500');
      p.push('');
      p.push('6. PIXEL-PERFECT POSITIONING: Every element\'s top, right, bottom, left, margin, and padding MUST match the /* @(x,y,w,h) */ annotations in the visual spec to the pixel. If an element is annotated @(120,48,400,600) then its container offset, scroll position, and box model must sum to exactly those coordinates. No rounding, no "close enough." Verify with the layout annotations provided.');
      p.push('7. COMPLETE FONT STACK: Every font-family, font-weight, font-size, line-height, letter-spacing, text-transform, font-style, and font-variant from the CSS spec must appear in your output. If the source uses "Inter, system-ui, sans-serif" at 400 weight and 14px size with 0.01em letter-spacing, your output must do exactly the same. Import webfonts via @import or @font-face with the exact families and weights. Include font-display: swap on every @font-face. Match any @font-face rules (unicode-range, font-style, font-weight) from the source exactly.');
      p.push('8. ALL INTERACTION STATES: Every interactive element must define :hover, :focus, :active, :disabled, and :focus-visible styles matching the source\'s behavior exactly. If the source button darkens 10% on hover and shows a ring on focus, your button must do exactly the same. If the source has a specific :focus-visible outline style, replicate it. Include cursor: pointer on all clickable elements, cursor: not-allowed on disabled. Match transition durations on state changes.');
      p.push('9. CSS ANIMATIONS & TRANSITIONS: Replicate every @keyframes block from the /* @KEYFRAMES */ section exactly — same name, same keyframe percentages (including 0% and 100%), same property values at each keyframe. Apply animations to the correct elements with the exact duration, easing (copy the cubic-bezier or steps() function verbatim), delay, iteration count (including "infinite" if specified), direction, fill-mode, and play-state. CSS transitions must match the source\'s property list, duration, timing function, and delay. No dropped, simplified, or approximated keyframes.');
      p.push('10. FORM VALIDATION & BEHAVIOR: Every <form>, <input>, <select>, <textarea> must match the source\'s types, patterns, min/max, required/disabled/readonly attributes, placeholders, default values, and associated <label> elements. Implement real client-side validation using the Constraint Validation API (setCustomValidity for custom messages). Show inline error states — red border on invalid fields, error text below the input, error color matching source style. Disable submit button until the form is valid. On submit, preventDefault and collect form data (matching source behavior) or submit to the action URL if the source does.');
      p.push('11. FULLY ACCESSIBLE: Every interactive element needs an accessible name (aria-label on icon buttons, aria-labelledby for composite widgets, or visible label text). Use correct ARIA roles: role="button" for clickable divs, role="navigation" for nav, role="tab"/"tablist"/"tabpanel" for tab interfaces, role="alert" for errors, role="dialog"/"aria-modal" for modals. Include aria-expanded on expandable elements, aria-current="page" on active nav links, aria-checked on custom radios/checkboxes, aria-required on required fields, aria-invalid on validation errors. All images must have alt text (use the source\'s alt text, or alt="" for decorative). Focus order follows DOM order. Include a skip-to-content link as the first focusable element. Announce dynamic content with aria-live="polite" or "assertive". Trap focus in open modals and return focus on close. Support prefers-reduced-motion by disabling all non-essential animations.');
      p.push('12. IMAGES & MEDIA: Use the exact image URLs from the /* IMAGES */ section. Do not modify, rehost, or substitute images. Set explicit width and height attributes (matching the source dimensions) on every <img> to prevent layout shift. Include loading="lazy" for below-fold images, loading="eager" for above-fold. Use the source\'s object-fit, object-position, background-size, background-position, and background-repeat values exactly. For responsive images, replicate srcset and sizes attributes if present. For <picture> elements, preserve all <source> tags. No placeholder images, no picsum, no unsplash, no generated.photos substitutions. If the source uses inline SVGs, preserve every path, viewBox, fill, and stroke exactly.');
      p.push('13. LAYERED VISUAL EFFECTS: Replicate every box-shadow (including inset and multiple shadows), text-shadow, backdrop-filter, filter (including drop-shadow, blur, contrast, etc.), CSS gradient (linear-gradient, radial-gradient, conic-gradient with all color stops), mask-image, clip-path, and mix-blend-mode from the spec. If the source uses "backdrop-filter: blur(16px) saturate(180%)" on a navbar, your output must too. Opacity values must be exact. Transform origins must be exact. z-index layering must match the spec\'s stacking context exactly. Multiple backgrounds/backdrops must stack in the correct order.');
      p.push('14. RESPONSIVE & VIEWPORT MATCHING: The output must be pixel-identical at the source viewport width (from /* VIEWPORT: WxH */). Set the viewport meta tag with the same content as the source. Replicate every @media (min-width/max-width) query and its rules verbatim. If the source has print styles, dark-mode overrides, or prefers-reduced-motion queries, include them. The HTML must render correctly at all breakpoints the source supports.');
      p.push('15. EXACT HTML SHELL & META: Use the exact <!DOCTYPE html> declaration (no XHTML). Match the <html lang="..."> attribute from the source. Include ALL <meta> tags from the source in order: charset, viewport, description, og:*, twitter:*, theme-color, etc. Preserve every data-* attribute, role attribute, aria-* attribute, and class name from the SOURCE HTML. The output must validate as HTML5 with zero errors.');
      p.push('16. TYPOGRAPHY SCALING & @FONT-FACE: Replicate fluid type sizing (clamp(), min(), max(), vw/vh-based sizes, calc()) exactly as the source uses them. If the source uses "clamp(0.875rem, 0.5vw + 0.75rem, 1.125rem)" for body text, use the exact same expression. Replicate every @font-face rule: same font-family name, src URLs, font-weight range, font-style, font-display, unicode-range, and font-stretch. If the source uses variable fonts (font-weight without matching weight file), handle them correctly.');
      p.push('17. SCROLLBAR & OVERFLOW: Replicate the source\'s scrollbar styling (::-webkit-scrollbar, scrollbar-width, scrollbar-color, track/thumb colors, border radius on scrollbar). Match overflow-x, overflow-y, overflow-anchor, overflow-wrap, and scroll-behavior properties. If the source uses scroll-snap-type/scroll-snap-align, replicate it. If the source has smooth scrolling, include scroll-behavior: smooth. If the source hides scrollbars while allowing scroll, replicate that behavior.');
      p.push('18. SVG, CANVAS & EMBEDDED MEDIA: Replicate every inline <svg> exactly — same viewBox, same <path>, <circle>, <rect>, <line>, <polygon>, <text> elements with exact coordinates, fills, strokes, stroke-widths, and opacity. For <canvas>, preserve width, height, and any inline drawing attributes. For <iframe>, preserve src (resolve relative to the source page), width, height, allow, sandbox attributes. For <video>/<audio>, preserve src or <source> children, controls, autoplay, loop, muted, poster attributes exactly.');
      p.push('19. LOADING, TRANSITION & ERROR STATES: Match the source\'s loading indicators (spinners, skeletons, progress bars) with exact colors and sizing. Include content transitions (fade, slide, scale) matching the source\'s transition-property and timing values. Implement error states for: failed image loads (onerror fallback), form validation errors (inline messages), network failures (retry UI with source styling), empty states (the source\'s "no results" messaging). Use the same toaster/notification style as the source for success/error/info messages.');
      p.push('20. VERIFICATION CHECKLIST: Before finishing, verify: (a) every CSS value from the spec appears literally in the output, (b) every /* IMAGES */ URL is used as-is, (c) every @keyframes rule is reproduced at full fidelity, (d) every interactive element has a working event handler, (e) the output is a single self-contained HTML file (no external deps), (f) the page renders identically to the source at the viewport size specified.');
    }
  p.push('');

  // --- OUTPUT ---
  p.push('--- OUTPUT ---');
  if (isFullSite) {
    p.push('A complete multi-page website in a single self-contained HTML file with embedded CSS and JS. Use hash-based routing so all pages are accessible from one file. Every "page" must be a distinct section/div shown when its route is active. Include smooth transitions between pages. The navigation must update the active state when switching pages. Each page must have unique, meaningful content -- no stubs, no TODOs, no placeholders, no lorem ipsum. Production-ready, fully functional, all interactive elements working on every page.');
    p.push('VERIFICATION: Before finishing, verify: (a) clicking every nav link navigates correctly, (b) active page indicator updates, (c) each page has unique content matching its label, (d) design is consistent across all pages, (e) no placeholder content exists anywhere, (f) all interactive elements work on every page.');
  } else if (detailLevel >= 9) {
    p.push('A single complete HTML file with embedded CSS and JS. No frameworks, no external deps, no TODOs, no placeholders, no lorem ipsum. Production-ready.');
    p.push('VERIFICATION: Before finishing, self-check: every CSS value from the spec appears literally, every IMAGE URL is used as-is, every @keyframes rule is reproduced at full fidelity, every interactive element has a working handler, the page renders identically to the source at the given viewport. Do not skip any rule. If the output would be too long, expand it rather than truncating or omitting detail.');
  } else {
    p.push('A single complete HTML file with embedded CSS and JS. No frameworks, no external deps, no TODOs, no placeholders, no lorem ipsum. Production-ready.');
  }

  return p.join('\n');
}

function frameworkLabel(val) {
  const map = { nextjs: 'Next.js (React SSR/SSG)', nuxt: 'Nuxt (Vue SSR/SSG)', react: 'React + Vite', vanilla: 'Vanilla HTML / CSS / JS' };
  return map[val] || val;
}
function cssLabel(val) {
  const map = { tailwind: 'Tailwind CSS', scss: 'SCSS/Sass', 'vanilla-css': 'Vanilla CSS', 'css-modules': 'CSS Modules' };
  return map[val] || val;
}

/* ============================================================
   INFERENCE HELPERS
   ============================================================ */
function inferProductType(text) {
  const lower = text.toLowerCase();
  const rules = [
    [/\b(saas|dashboard|analytics|metrics|report|billing|subscription)\b/, 'SaaS / Analytics Platform'],
    [/\b(ecommerce|shop|store|cart|checkout|product|pricing|marketplace)\b/, 'E-commerce / Marketplace'],
    [/\b(social|feed|post|message|chat|community|forum)\b/, 'Social / Community Platform'],
    [/\b(portfolio|gallery|showcase|work|project|creative|design)\b/, 'Portfolio / Creative Showcase'],
    [/\b(blog|article|news|editorial|magazine|publication)\b/, 'Blog / Editorial / Content'],
    [/\b(landing|marketing|homepage|hero|brand|promo)\b/, 'Marketing Landing Page'],
    [/\b(education|course|learning|tutorial|class|training|lesson)\b/, 'Education / Learning Platform'],
    [/\b(game|gaming|leaderboard|score|play|level)\b/, 'Gaming / Entertainment'],
    [/\b(health|fitness|wellness|medical|patient|doctor|clinic)\b/, 'Health / Fitness / Medical'],
    [/\b(finance|banking|investment|payment|wallet|money|crypto|blockchain)\b/, 'Finance / Fintech'],
    [/\b(travel|hotel|booking|flight|vacation|trip)\b/, 'Travel / Hospitality'],
    [/\b(real.estate|property|rental|listing|mortgage|apartment)\b/, 'Real Estate / Property'],
    [/\b(food|restaurant|recipe|cooking|delivery|menu|meal)\b/, 'Food / Restaurant / Recipe'],
    [/\b(tool|utility|calculator|converter|generator|editor|scanner)\b/, 'Web Tool / Utility'],
    [/\b(ai|artificial.intelligence|machine.learning|ml|llm|gpt|neural)\b/, 'AI / Machine Learning Product'],
    [/\b(music|audio|podcast|playlist|streaming|sound)\b/, 'Music / Audio / Podcast'],
    [/\b(video|streaming|movie|tv|watch|film|cinema)\b/, 'Video / Streaming Platform'],
    [/\b(event|ticket|conference|meetup|workshop|webinar)\b/, 'Event / Ticketing Platform'],
    [/\b(recruiting|job|hiring|career|resume|application)\b/, 'Recruiting / Job Board'],
  ];
  for (const [re, label] of rules) { if (re.test(lower)) return label; }
  return 'Web Application / Landing Page';
}

function extractFeatures(text) {
  const features = [];
  const lines = text.split(/[.\n\r]+/).map(s => s.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.length < 15) continue;
    if (/\b(ability to|allows|can |feature |includes|provides|supports|enables|lets you|built.with|powered.by|integrat)\b/i.test(line) ||
        /\b(login|signup|auth|search|filter|sort|upload|download|share|like|comment|follow|notif|dashboard|report|chart|payment|checkout|cart|pricing|profile|setting|message|chat|post|feed|import|export|sync|track|monitor|schedule|remind|bookmark|save|rate|review|subscribe|manage|create|edit|delete|view|browse|explore|discover)\b/i.test(line)) {
      features.push(line.replace(/^[-*\s]+/, '').trim());
    }
  }
  return [...new Set(features)];
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', init);
