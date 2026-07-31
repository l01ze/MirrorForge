/* ============================================================
   MirrorForge — Animation Utilities
   Laser scan overlay, typewriter effect, toast system.
   All animations use requestAnimationFrame where applicable,
   respect prefers-reduced-motion, and use transform/opacity.
   ============================================================ */

/* ============================================================
   LASER SCAN
   ============================================================ */

/**
 * Trigger the laser scan animation on the overlay element.
 * Uses requestAnimationFrame for smooth performance.
 * @param {HTMLElement} overlayEl - The laser overlay DOM element
 */
function triggerLaserScan(overlayEl) {
  if (!overlayEl) return;

  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Reset and activate
  overlayEl.classList.remove('active');
  void overlayEl.offsetWidth; // Force reflow for animation restart
  overlayEl.classList.add('active');

  // Auto-remove after animation completes
  setTimeout(() => {
    overlayEl.classList.remove('active');
  }, 1600);
}

/* ============================================================
   TYPEWRITER EFFECT
   ============================================================ */

/**
 * Simulate typing text into a textarea with a typewriter effect.
 * Uses requestAnimationFrame for timing.
 * @param {HTMLTextAreaElement} textarea - The target textarea
 * @param {string} text - The full text to type out
 * @param {number} [speed=15] - Milliseconds per character (higher = slower)
 * @returns {Promise<void>} Resolves when typing is complete
 */
function typeText(textarea, text, speed = 15) {
  return new Promise((resolve) => {
    if (!textarea) {
      resolve();
      return;
    }

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      textarea.value = text;
      textarea.classList.remove('typing');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      resolve();
      return;
    }

    textarea.value = '';
    textarea.classList.add('typing');
    textarea.readOnly = false;

    let index = 0;
    let lastTime = 0;
    const charTimes = []; // Track timing for each character

    // Calculate adaptive speed based on text length
    const totalChars = text.length;
    const targetDuration = Math.min(totalChars * speed, 3000); // Cap at 3 seconds
    const timePerChar = targetDuration / totalChars;

    function typeChunk(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      // Type multiple characters per frame for long texts
      const charsToType = Math.max(1, Math.floor(elapsed / timePerChar));
      const endIndex = Math.min(index + charsToType, totalChars);

      if (endIndex > index) {
        textarea.value = text.substring(0, endIndex);
        index = endIndex;

        // Dispatch input event for any listeners
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }

      lastTime = timestamp;

      if (index < totalChars) {
        requestAnimationFrame(typeChunk);
      } else {
        // Complete
        textarea.value = text;
        if (textarea.value.length > 0) {
          // Scroll to top to show beginning of text
          textarea.scrollTop = 0;
        }
        textarea.classList.remove('typing');
        textarea.readOnly = true;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        // Brief delay then resolve
        setTimeout(resolve, 100);
      }
    }

    // Start the animation
    requestAnimationFrame(typeChunk);
  });
}

/* ============================================================
   TOAST SYSTEM
   ============================================================ */

let toastTimeout = null;
let activeToast = null;

/**
 * Show a toast notification.
 * @param {string} message - The message to display
 * @param {'success' | 'error' | 'info'} [type='info'] - Toast type
 * @param {number} [duration=3000] - How long to show in ms
 */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  // Remove existing toast with exit animation
  if (activeToast) {
    activeToast.classList.add('toast-exit');
    setTimeout(() => {
      if (activeToast && activeToast.parentNode) {
        activeToast.parentNode.removeChild(activeToast);
      }
      activeToast = null;
    }, 200);
    clearTimeout(toastTimeout);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');

  // Icon based on type
  const iconSvg = getToastIcon(type);
  const iconEl = document.createElement('span');
  iconEl.className = 'toast-icon';
  iconEl.innerHTML = iconSvg;
  toast.appendChild(iconEl);

  const msgEl = document.createElement('span');
  msgEl.className = 'toast-message';
  msgEl.textContent = message;
  toast.appendChild(msgEl);

  container.appendChild(toast);
  activeToast = toast;

  // Auto dismiss
  toastTimeout = setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        if (activeToast === toast) {
          activeToast = null;
        }
      }, 200);
    }
  }, duration);
}

/**
 * Get the SVG icon for a toast type.
 * @param {'success' | 'error' | 'info'} type
 * @returns {string} SVG markup
 */
function getToastIcon(type) {
  const svgAttrs = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

  switch (type) {
    case 'success':
      return `<svg ${svgAttrs}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    case 'error':
      return `<svg ${svgAttrs}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    case 'info':
    default:
      return `<svg ${svgAttrs}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }
}
