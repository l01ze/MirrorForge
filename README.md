# 🔮 MirrorForge

> **Replicate any page on the web.** Generate production-ready 1:1 cloning prompts for any website — URL, local file, or plain description.



MirrorForge is a Chrome extension that extracts the full structure, styling, and content of any web page and turns it into a detailed, model-optimized prompt. Drop in a URL, paste a `file:///` path, or describe what you want — MirrorForge handles the rest.

https://github.com/user-attachments/assets/2228b96e-394a-444e-af17-6ec83b21be19

---

## ✨ Features

- **🔗 Smart URL Cloning** — Paste any URL and MirrorForge fetches the full page behind the scenes. Works with `file:///` local files too.
- **📝 Text-to-Prompt** — Describe a website or app in words, and MirrorForge builds a structured specification prompt.
- **🎨 9 Theme Presets + Custom Colors** — Midnight, Slate, Emerald, Amber, Rose, Ocean, Forest, Sunset, Mono — plus full custom color pickers.
- **🧠 Multi-Model Optimized** — Prompts are wrapped with model-specific instructions for Claude, GPT-4o, DeepSeek, Gemini, Grok, Mistral, or Generic.
- **⚙️ Detail Levels** — Choose between **Basic Skeleton**, **Standard Stack**, or **Max Precision Clone** with pixel-perfect positioning, all interaction states, animations, fonts, accessibility, and production polish.
- **📋 Prompt History** — Last 5 generated prompts are saved and restorable.
- **💾 State Persistence** — All settings, theme, and input survive tab switches and browser restarts.
- **🕶️ Hidden Tab Scraping** — Page content is fetched in a minimized window — no flashing tabs, no distractions.
- **🎯 Auto-Detect Model** — When cloning from an AI chat URL (Claude, ChatGPT, DeepSeek, etc.), the prompt is automatically tuned for that model.

---

## 🚀 How to Use

### Installation

1. Open `chrome://extensions/` in Chrome
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select the `MirrorForge` folder
4. Pin MirrorForge to your toolbar for quick access

> **For local files:** Go to Chrome Extensions → MirrorForge → Details → **Allow access to file URLs**

### Quick Start

1. Click the MirrorForge icon in your toolbar
2. Choose an input mode:
   - **Web URL** — paste a URL to clone
   - **Web Desc** — describe a website in words
   - **App URL** — clone a web app (switches to app-optimized prompts)
   - **App Desc** — describe an app
3. Adjust **Prompt Detail** slider (1 = Basic Skeleton, 2 = Standard Stack, 3 = Max Precision Clone)
4. Pick your **Framework**, **CSS**, and **Target Model**
5. Click **Forge Prompt** ✦

The generated prompt appears in the output panel — copy it with one click or download as `.txt`.

### Navigation

- **Settings** ⚙️ — Click the gear icon to slide to the settings page (themes, custom colors, model display). Click the **←** back arrow to return.
- **Scan Tab** 📱 — Fills the URL input with your current tab's address.
- **History** 📋 — Click "Previous Prompts" to revisit recent forges.

---

## 🎨 Themes

| Theme | Accent | Vibe |
|-------|--------|------|
| Midnight | Blue | Default dark |
| Slate | Gray | Cool minimal |
| Emerald | Green | Natural |
| Amber | Gold | Warm |
| Rose | Pink | Elegant |
| Ocean | Cyan | Fresh |
| Forest | Dark Green | Earthy |
| Sunset | Orange | Vibrant |
| Mono | Gray | Pure grayscale |

Open **Settings → Appearance** to browse and apply themes instantly.

---

## 🧩 Tech Stack Options

MirrorForge bakes your tech preferences into every prompt:

- **Frameworks:** Auto, Next.js, Nuxt, Vanilla HTML/CSS/JS, React (Vite)
- **CSS:** Auto, Tailwind, SCSS, Vanilla CSS, CSS Modules
- **Models:** Auto, Claude, GPT-4o, DeepSeek, Gemini, Grok, Mistral, Generic

---

## 📁 Project Structure

```
MirrorForge/
├── manifest.json          # Extension manifest (MV3)
├── icons/                 # Extension icons (16/48/128 PNG)
├── popup/
│   ├── popup.html         # Popup UI
│   ├── popup.css          # Styles + theme system
│   └── popup.js           # Core logic & state management
├── background/
│   └── service-worker.js  # MV3 service worker
└── content/
    └── scraper.js         # Page content extraction
```

---

## 💡 Requirements

- **Chrome 109+** (Manifest V3)
- Permissions: `activeTab`, `scripting`, `storage`, `clipboardWrite`
- Host permissions: `http://*/*`, `https://*/*`, `file:///*`

---

## 📄 License

MIT — MirrorForge Labs. Clone anything, build everything.
