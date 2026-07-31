/* ============================================================
   MirrorForge — Background Service Worker (Manifest V3)
   Tab management, messaging broker, extension lifecycle
   ============================================================ */

const EXTENSION_NAME = 'MirrorForge';

/* ============================================================
   INSTALL & ACTIVATE
   ============================================================ */
chrome.runtime.onInstalled.addListener((details) => {
  const { reason } = details;

  if (reason === 'install') {
    console.log(`[${EXTENSION_NAME}] Installed. Setting default state.`);
    chrome.storage.session.set({
      mirrorForgeMode: 'website',
      mirrorForgeSource: 'url',
      mirrorForgeInstalledAt: Date.now(),
    });
  } else if (reason === 'update') {
    console.log(`[${EXTENSION_NAME}] Updated from ${details.previousVersion} -> ${chrome.runtime.getManifest().version}`);
  }

  // Verify host permissions
  chrome.permissions.contains({
    permissions: ['activeTab', 'scripting', 'storage'],
  }, (result) => {
    if (!result) {
      console.warn(`[${EXTENSION_NAME}] Missing required permissions.`);
    }
  });
});

/* ============================================================
   MESSAGE BROKER
   ============================================================ */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, ...payload } = message || {};

  switch (type) {
    case 'MIRRORFORGE_PING':
      sendResponse({ ok: true, name: EXTENSION_NAME });
      return false;

    default:
      // Unknown message — silently ignore
      return false;
  }
});

/* ============================================================
   KEYBOARD COMMAND (Ctrl+Shift+M)
   ============================================================ */
chrome.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    // Chrome handles the popup automatically
    console.log(`[${EXTENSION_NAME}] Command triggered: ${command}`);
  }
});

/* ============================================================
   ERROR HANDLING (Service Worker Global)
   ============================================================ */
self.addEventListener('error', (event) => {
  console.error(`[${EXTENSION_NAME}] Global error:`, event.error || event.message);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error(`[${EXTENSION_NAME}] Unhandled rejection:`, event.reason);
});
