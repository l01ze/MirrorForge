/* ============================================================
   MirrorForge — Content Scraper
   Extracts structured page data for prompt generation.
   Injected into all URLs at document_idle.
   ============================================================ */

(function () {
  'use strict';

  const EXTENSION_ID = chrome.runtime.id;

  /* ============================================================
     SCRAPE ENGINE
     ============================================================ */
  function scrapePage(url) {
    const doc = document;
    const startTime = performance.now();

    // --- Metadata ---
    const metadata = {
      url: url || doc.URL,
      title: doc.title || '',
      description: getMetaContent('description'),
      keywords: getMetaContent('keywords'),
      ogTitle: getMetaContent('og:title', 'property'),
      ogDescription: getMetaContent('og:description', 'property'),
      ogImage: getMetaContent('og:image', 'property'),
      ogType: getMetaContent('og:type', 'property'),
      twitterCard: getMetaContent('twitter:card', 'name'),
      twitterSite: getMetaContent('twitter:site', 'name'),
      canonical: getCanonical(),
      charset: doc.characterSet || 'UTF-8',
      lang: doc.documentElement.lang || 'en',
      viewport: getMetaContent('viewport'),
      themeColor: getMetaContent('theme-color'),
    };

    // --- Headings Structure ---
    const headings = [];
    try {
      const hs = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      hs.forEach((h) => {
        const tag = h.tagName.toLowerCase();
        const text = cleanText(h.textContent);
        if (text) {
          headings.push({ level: tag, text });
        }
      });
    } catch (e) {
      // Silently skip if DOM access restricted
    }

    // --- All visible text (prioritized) ---
    const textContent = extractVisibleText(doc);

    // --- Links ---
    const links = [];
    try {
      const anchors = doc.querySelectorAll('a[href]');
      anchors.forEach((a) => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          links.push({
            text: cleanText(a.textContent),
            href: href,
          });
        }
      });
    } catch (e) {
      // Skip
    }

    // --- Images (with alt text) ---
    const images = [];
    try {
      const imgs = doc.querySelectorAll('img[src]');
      imgs.forEach((img) => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          images.push({
            alt: img.getAttribute('alt') || '',
            src: src,
          });
        }
      });
    } catch (e) {
      // Skip
    }

    // --- Buttons & CTAs ---
    const buttons = [];
    try {
      const btns = doc.querySelectorAll('button, [role="button"], .btn, .cta, .button');
      btns.forEach((b) => {
        const text = cleanText(b.textContent);
        if (text) {
          buttons.push({
            text: text,
            type: b.type || (b.tagName === 'BUTTON' ? 'button' : 'link'),
            className: (b.className && typeof b.className === 'string') ? b.className.trim().split(/\s+/).slice(0,3).join(' ') : '',
            formId: b.closest('form')?.id || b.form?.id || '',
            hasOnClick: b.hasAttribute('onclick') || b.hasAttribute('data-action') || false,
          });
        }
      });
    } catch (e) {
      // Skip
    }

    // --- Forms ---
    const forms = [];
    try {
      const formEls = doc.querySelectorAll('form');
      formEls.forEach((f) => {
        const inputs = [];
        f.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach((inp) => {
          const label = findLabel(inp);
          inputs.push({
            type: inp.type || inp.tagName.toLowerCase(),
            name: inp.name || '',
            placeholder: inp.placeholder || '',
            label: label || '',
          });
        });
        forms.push({
          action: f.action || '',
          method: f.method || 'get',
          inputs,
        });
      });
    } catch (e) {
      // Skip
    }

    // --- Navigation ---
    const navItems = [];
    try {
      const navs = doc.querySelectorAll('nav a, header a, [role="navigation"] a');
      navs.forEach((a) => {
        const text = cleanText(a.textContent);
        if (text) {
          navItems.push(text);
        }
      });
    } catch (e) {
      // Skip
    }

    // --- Color scheme detection ---
    const computedStyle = getComputedStyle(doc.body);
    const bgColor = computedStyle.backgroundColor;
    const textColor = computedStyle.color;
    const fontFamily = computedStyle.fontFamily;

    const elapsed = Math.round(performance.now() - startTime);

    return {
      metadata,
      headings,
      textContent: textContent.substring(0, 100000), // cap at 100k chars (increased for max precision)
      links: links.slice(0, 100), // max 100 links
      images: images.slice(0, 50), // max 50 images
      buttons: [...new Set(buttons)].slice(0, 30),
      forms,
      navItems: [...new Set(navItems)].slice(0, 30),
      colors: {
        background: bgColor,
        text: textColor,
      },
      fonts: fontFamily,
      visualReport: extractCSSSpec(doc),
      strippedHTML: extractStrippedHTML(doc),
      headingCount: headings.length,
      linkCount: links.length,
      imageCount: images.length,
      buttonCount: buttons.length,
      elapsed,
      siteLinks: categorizeLinks(doc, url),
    };
  }

  /* ============================================================
     HELPERS
     ============================================================ */
  function getMetaContent(name, attr = 'name') {
    try {
      const el = document.querySelector(`meta[${attr}="${name}"]`);
      return el ? el.getAttribute('content') || '' : '';
    } catch {
      return '';
    }
  }

  function getCanonical() {
    try {
      const el = document.querySelector('link[rel="canonical"]');
      return el ? el.getAttribute('href') || '' : '';
    } catch {
      return '';
    }
  }

  function cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();
  }

  function extractVisibleText(doc) {
    const paragraphs = [];
    try {
      const pEls = doc.querySelectorAll('p, li, td, th, blockquote, figcaption, dt, dd');
      pEls.forEach((el) => {
        const text = cleanText(el.textContent);
        if (text && text.length > 10) {
          paragraphs.push(text);
        }
      });
    } catch (e) {
      // Skip
    }
    return paragraphs.join('\n');
  }

  function findLabel(input) {
    try {
      const id = input.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) return cleanText(label.textContent);
      }
      const parent = input.closest('label');
      if (parent) return cleanText(parent.textContent);
      const ariaLabel = input.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel;
      const placeholder = input.getAttribute('placeholder');
      if (placeholder) return placeholder;
    } catch {
      // Skip
    }
    return '';
  }

  /* ============================================================
     COMPREHENSIVE ELEMENT-LEVEL CSS EXTRACTION (for 1:1 clone)
     Walks the DOM and extracts computed CSS for every visible element.
     ============================================================ */

  function normalizeColor(color) {
    if (!color) return null;
    if (color.startsWith('#')) return color.substring(0, 7);
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (m) {
      const hex = '#' + [1,2,3].map(i => parseInt(m[i]).toString(16).padStart(2,'0')).join('');
      if (m[4] !== undefined && parseFloat(m[4]) < 1) return hex + ' (alpha:' + m[4] + ')';
      return hex;
    }
    return color;
  }

  function extractImageDetails(doc) {
    const imgs = [];
    doc.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        const s = getComputedStyle(img);
        imgs.push({
          src, alt: img.getAttribute('alt') || '',
          w: img.getAttribute('width') || img.naturalWidth || '',
          h: img.getAttribute('height') || img.naturalHeight || '',
          cssW: s.width || '',
          cssH: s.height || '',
          objectFit: s.objectFit || '',
          objectPosition: s.objectPosition || '',
          borderRadius: s.borderRadius || '',
          opacity: s.opacity || '',
          mixBlendMode: s.mixBlendMode || 'normal',
          hasBgImage: s.backgroundImage && s.backgroundImage !== 'none' ? s.backgroundImage : '',
        });
      }
    });
    // Also collect background images from non-img elements
    doc.querySelectorAll('*:not(img):not(script):not(style)').forEach(el => {
      if (imgs.length >= 80) return;
      const s = getComputedStyle(el);
      if (s.backgroundImage && s.backgroundImage !== 'none' && s.backgroundImage !== 'initial') {
        const urlMatch = s.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
        if (urlMatch) {
          const bgUrl = urlMatch[1];
          if (bgUrl && !bgUrl.startsWith('data:') && !imgs.some(i => i.src === bgUrl)) {
            const rect = el.getBoundingClientRect();
            imgs.push({
              src: bgUrl, alt: '(background) ' + (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '')),
              w: Math.round(rect.width) || '', h: Math.round(rect.height) || '',
              cssW: s.width || '', cssH: s.height || '',
              objectFit: s.backgroundSize || '', objectPosition: s.backgroundPosition || '',
              borderRadius: s.borderRadius || '',
              opacity: s.opacity || '', mixBlendMode: s.mixBlendMode || 'normal',
              hasBgImage: s.backgroundImage,
              backgroundRepeat: s.backgroundRepeat || '',
              isBackground: true,
            });
          }
        }
      }
    });
    return imgs.slice(0, 80);
  }

  function categorizeLinks(doc, pageUrl) {
    const origin = pageUrl ? new URL(pageUrl).origin : document.location.origin;
    const internal = [];
    const external = [];
    const anchors = [];
    try {
      doc.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        if (href.startsWith('#')) { anchors.push({ href, text: cleanText(a.textContent) }); return; }
        if (href.startsWith('javascript:')) return;
        try {
          const resolved = new URL(href, pageUrl || document.URL).href;
          const linkOrigin = new URL(resolved).origin;
          const linkPath = new URL(resolved).pathname;
          const isNav = a.closest('nav') || a.closest('header') || a.closest('[role="navigation"]');
          const text = cleanText(a.textContent);
          if (linkOrigin === origin && !href.startsWith('#')) {
            internal.push({ href: resolved, path: linkPath, text, isNav: !!isNav });
          } else if (linkOrigin !== origin) {
            external.push({ href: resolved, text });
          }
        } catch { /* skip unparseable */ }
      });
    } catch(e) {}
    return { internal: internal.slice(0, 50), external: external.slice(0, 30), anchors: anchors.slice(0, 20) };
  }

  const CSS_PROPS = [
    'display','position','flexDirection','flexWrap','justifyContent','alignItems','gap',
    'gridTemplateColumns','gridTemplateRows','gridColumn','gridRow','gridArea',
    'padding','margin','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'marginTop','marginRight','marginBottom','marginLeft',
    'width','height','minWidth','minHeight','maxWidth','maxHeight',
    'inset','top','right','bottom','left',
    'color','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','backgroundRepeat',
    'fontFamily','fontWeight','fontSize','lineHeight','textAlign','letterSpacing','textTransform','textDecoration',
    'wordSpacing','whiteSpace','wordBreak','overflowWrap',
    'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
    'borderWidth','borderStyle','borderColor','outline','outlineWidth','outlineStyle','outlineColor',
    'boxShadow','opacity','transform','transformOrigin',
    'transition','transitionDuration','transitionTimingFunction','transitionDelay',
    'animationName','animationDuration','animationTimingFunction','animationDelay',
    'animationIterationCount','animationDirection','animationFillMode','animationPlayState',
    'cursor','overflow','overflowX','overflowY','zIndex','float',
    'verticalAlign','pointerEvents','userSelect','objectFit','objectPosition',
    'filter','backdropFilter','mixBlendMode','isolation',
    'willChange','clipPath','maskImage','scrollBehavior',
  ];

  const SKIP_TAGS = new Set(['script','style','link','meta','noscript','template','br','hr','wbr']);

  function getElCSS(el) {
    const s = getComputedStyle(el);
    const r = {};
    for (const prop of CSS_PROPS) {
      let val = typeof s[prop] === 'string' ? s[prop].trim() : String(s[prop] || '');
      if (!val || val === '' || val === 'inherit' || val === 'initial' || val === 'unset') continue;
      if (val.length > 120) val = val.slice(0, 120) + '…';
      r[prop] = val;
    }
    return r;
  }

  function isVisible(el) {
    try {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 2 && rect.height > 2;
    } catch(e) { return false; }
  }

  function isInteractive(el) {
    const tag = el.tagName.toLowerCase();
    return tag === 'a' || tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea' ||
      el.getAttribute('role') === 'button' || el.getAttribute('role') === 'link' ||
      el.getAttribute('role') === 'tab' || el.getAttribute('role') === 'menuitem' ||
      el.hasAttribute('onclick') || el.getAttribute('tabindex') === '0' ||
      el.hasAttribute('contenteditable') || el.getAttribute('draggable') === 'true' ||
      el.tagName === 'DETAILS' || el.tagName === 'SUMMARY';
  }

  function getSelector(el) {
    let sel = el.tagName.toLowerCase();
    if (el.id) sel += '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      const cls = el.className.trim().split(/\s+/).filter(c => c && !c.startsWith('ng-') && !c.startsWith('_') && !c.startsWith('sc-')).slice(0,3).join('.');
      if (cls) sel += '.' + cls;
    }
    return sel;
  }

  function getDirectText(el) {
    let text = '';
    for (const node of el.childNodes) {
      if (node.nodeType === 3) {
        const t = (node.textContent || '').replace(/\s+/g, ' ').trim();
        if (t && t.length > 1) { text = t.slice(0, 100); break; }
      }
    }
    if (!text) {
      text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100);
      if (el.children.length > 0 && text.length > 0) text = '';
    }
    return text;
  }

  function collectElements(doc) {
    const els = [];
    const max = 300;
    try {
      const all = doc.querySelectorAll('body *');
      for (let i = 0; i < all.length && els.length < max; i++) {
        const el = all[i];
        const tag = el.tagName.toLowerCase();
        if (SKIP_TAGS.has(tag)) continue;
        if (!isVisible(el)) continue;

        const css = getElCSS(el);
        const text = getDirectText(el);
        if (!text && Object.keys(css).length === 0 && el.children.length <= 1) continue;
        if (tag === 'div' && !text && Object.keys(css).length === 0) continue;

        els.push({
          tag, selector: getSelector(el),
          text: text.slice(0, 70),
          css,
          interactive: isInteractive(el),
          depth: getDepth(el, doc.body),
          rect: el.getBoundingClientRect(),
        });
      }
    } catch(e) {}
    return els;
  }

  function getDepth(el, root) {
    let d = 0;
    while (el && el !== root) { d++; el = el.parentElement; }
    return d;
  }

  const ABBR = {
    display:'DISP', position:'POS', flexDirection:'FLX', flexWrap:'WRAP',
    justifyContent:'JUST', alignItems:'ALIGN', gap:'GAP',
    padding:'PAD', margin:'MAR',
    width:'W', height:'H', minWidth:'MINW', minHeight:'MINH', maxWidth:'MXW', maxHeight:'MXH',
    color:'CLR', backgroundColor:'BG', backgroundImage:'BGI',
    fontFamily:'FONT', fontWeight:'FW', fontSize:'FS', lineHeight:'LH',
    textAlign:'TA', letterSpacing:'LS', textTransform:'TT', textDecoration:'TD',
    borderRadius:'RAD', border:'BDR', borderTop:'BDRT', borderBottom:'BDRB',
    borderLeft:'BDRL', borderRight:'BDRR', outline:'OUT',
    boxShadow:'SHD', opacity:'OP', transform:'XFORM',
    transition:'TRN', animationName:'ANM', animationDuration:'ANMD', animationTimingFunction:'ANME',
    cursor:'CUR', overflow:'OV', zIndex:'Z', float:'FLT', verticalAlign:'VA', whiteSpace:'WS',
  };

  function extractStrippedHTML(doc) {
    try {
      const clone = doc.body.cloneNode(true);
      clone.querySelectorAll('script, noscript, iframe, style').forEach(el => el.remove());
      clone.querySelectorAll('*').forEach(el => {
        [...el.attributes].forEach(attr => {
          if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
        });
      });
      let html = clone.innerHTML;
      html = html.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ');
      if (html.length > 100000) html = html.substring(0, 100000) + '\n<!-- TRUNCATED -->';
      return html;
    } catch(e) { return ''; }
  }

  function fmtCSSBlock(selector, css) {
    if (!css || Object.keys(css).length === 0) return '';
    const props = [];
    for (const [prop, val] of Object.entries(css)) {
      if (!val) continue;
      const kebab = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      props.push('  ' + kebab + ': ' + val + ';');
    }
    if (props.length === 0) return '';
    return selector + ' {\n' + props.join('\n') + '\n}';
  }

  function extractCSSSpec(doc) {
    const lines = [];
    const elements = collectElements(doc);

    // Viewport
    const vw = doc.documentElement.clientWidth;
    const vh = doc.documentElement.clientHeight;
    lines.push('/* VIEWPORT: ' + vw + 'x' + vh + ' */');
    lines.push('');

    // CSS rules for every visible element (ordered by DOM position)
    for (const el of elements) {
      if (Object.keys(el.css).length === 0) continue;
      const pos = el.rect ? ' @(' + Math.round(el.rect.left) + ',' + Math.round(el.rect.top) + ',' + Math.round(el.rect.width) + ',' + Math.round(el.rect.height) + ')' : '';
      const textComment = el.text ? '  /* "' + el.text.replace(/"/g, '\\"') + '" */' : '';
      lines.push('/* ' + (el.interactive ? '▸' : ' ') + ' ' + el.selector + pos + ' */' + textComment);
      lines.push(fmtCSSBlock(el.selector, el.css));
    }

    // Color palette summary
    lines.push('');
    lines.push('/* COLOR PALETTE */');
    const colors = new Set();
    for (const el of elements) {
      for (const [prop, val] of Object.entries(el.css)) {
        if (prop === 'color' || prop === 'backgroundColor' || prop.endsWith('Color')) {
          const c = normalizeColor(val);
          if (c) colors.add(c);
        }
      }
    }
    for (const c of [...colors].slice(0, 30)) lines.push('/*   ' + c + ' */');

    // Images
    lines.push('');
    lines.push('/* IMAGES */');
    extractImageDetails(doc).forEach(img => {
      const dims = (img.w || img.cssW) ? ' (' + (img.w || img.cssW) + 'x' + (img.h || img.cssH) + ')' : '';
      const extra = [];
      if (img.objectFit && img.objectFit !== 'fill') extra.push('obj-fit:' + img.objectFit);
      if (img.borderRadius && img.borderRadius !== '0px') extra.push('radius:' + img.borderRadius);
      if (img.isBackground) extra.push('BG');
      const tag = extra.length ? ' [' + extra.join(',') + ']' : '';
      lines.push('/*   ' + (img.alt || '(image)').replace(/\n/g, ' ') + ' : ' + img.src + dims + tag + ' */');
    });

    // @keyframes animations from stylesheets
    try {
      const keyframeNames = new Set();
      const keyframeBodies = {};
      for (const sheet of doc.styleSheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (!rules) continue;
          for (const rule of rules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE || rule.type === 7) {
              const name = rule.name || rule.keyText;
              if (!name || keyframeNames.has(name)) continue;
              keyframeNames.add(name);
              const parts = [];
              for (const keyframe of rule.cssRules || []) {
                const keyText = keyframe.keyText || '';
                const css = keyframe.cssText || '';
                parts.push('  ' + keyText + ' { ' + (css.split('{')[1]?.trim() || '') + ' }');
              }
              keyframeBodies[name] = parts.join('\n');
            }
          }
        } catch(e) { /* cross-origin stylesheets — skip */ }
      }
      if (keyframeNames.size > 0) {
        lines.push('');
        lines.push('/* @KEYFRAMES */');
        for (const name of keyframeNames) {
          lines.push('@keyframes ' + name + ' {');
          if (keyframeBodies[name]) lines.push(keyframeBodies[name]);
          lines.push('}');
        }
      }
    } catch(e) { /* skip animation extraction */ }

    // Interactive behavior notes
    const interactiveEls = elements.filter(e => e.interactive);
    if (interactiveEls.length > 0) {
      lines.push('');
      lines.push('/* INTERACTIVE ELEMENTS (' + interactiveEls.length + ' total) */');
      for (const el of interactiveEls.slice(0, 40)) {
        const tag = el.selector || el.tag;
        const hint = el.text ? '  /* "' + el.text.replace(/"/g, '\\"') + '" */' : '';
        lines.push('/* ▸ ' + tag + hint);
      }
    }

    return lines.join('\n');
  }

  /* ============================================================
     MESSAGE LISTENER
     ============================================================ */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === 'MIRRORFORGE_SCRAPE') {
      const targetUrl = message.url || document.URL;

      // Security: only scrape if the origin matches
      try {
        const msgOrigin = new URL(targetUrl).origin;
        const docOrigin = new URL(document.URL).origin;
        if (msgOrigin !== docOrigin) {
          sendResponse({
            error: 'Origin mismatch',
            content: null,
          });
          return false;
        }
      } catch {
        // If URL parsing fails, deny by default
        sendResponse({
          error: 'Invalid target URL',
          content: null,
        });
        return false;
      }

      try {
        const data = scrapePage(targetUrl);
        sendResponse({
          content: data.textContent,
          metadata: data.metadata,
          headings: data.headings,
          links: data.links,
          images: data.images,
          buttons: data.buttons,
          forms: data.forms,
          navItems: data.navItems,
          colors: data.colors,
          fonts: data.fonts,
          visualReport: data.visualReport,
          strippedHTML: data.strippedHTML,
          siteLinks: data.siteLinks,
          stats: {
            headings: data.headingCount,
            links: data.linkCount,
            images: data.imageCount,
            buttons: data.buttonCount,
            elapsed: data.elapsed,
          },
        });
      } catch (err) {
        sendResponse({
          error: err.message,
          content: null,
        });
      }

      return false;
    }
  });

  /* ============================================================
     SELF-REGISTER (announce to service worker)
     ============================================================ */
  try {
    chrome.runtime.sendMessage({
      type: 'MIRRORFORGE_PING',
      from: 'content_scraper',
      url: document.URL,
    }).catch(() => {
      // Service worker may not be ready — ignore
    });
  } catch (e) {
    // Synchronous error (e.g., invalid extension context) — ignore
  }

})();
